import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";

import { auth } from "../services/firebase";
import { notifyContacts } from "../services/notification";
import { createSOS } from "../services/sos";
import { updateLiveLocation } from "../services/tracking";
import { sendEmergencyAlerts } from "../services/emergency";

export type EmergencyState = "idle" | "countdown" | "sending" | "active" | "failed";

export type LastLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

function playAlarmSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.2);
  gain.connect(audioContext.destination);

  [0, 0.35, 0.7].forEach((offset) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + offset);
    oscillator.connect(gain);
    oscillator.start(audioContext.currentTime + offset);
    oscillator.stop(audioContext.currentTime + offset + 0.22);
  });

  window.setTimeout(() => {
    void audioContext.close();
  }, 1500);
}

type SOSFlowValue = {
  countdown: number | null;
  lastLocation: LastLocation | null;
  notifiedCount: number | null;
  resetCountdown: () => void;
  startSOS: () => void;
  state: EmergencyState;
};

const SOSFlowContext = createContext<SOSFlowValue | null>(null);

export function useSOSFlow(): SOSFlowValue {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [state, setState] = useState<EmergencyState>("idle");
  const [notifiedCount, setNotifiedCount] = useState<number | null>(null);
  const [lastLocation, setLastLocation] = useState<LastLocation | null>(null);

  const timerRef = useRef<number | null>(null);
  const watchRef = useRef<number | null>(null);
  const stateRef = useRef<EmergencyState>("idle");

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const resetCountdown = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
    stateRef.current = "idle";
    setState("idle");
  }, []);

  const sendSOS = useCallback(async () => {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      toast.error("User not logged in");
      stateRef.current = "failed";
      setState("failed");
      return;
    }

    stateRef.current = "sending";
    setState("sending");

    if (navigator.vibrate) {
      navigator.vibrate([300, 180, 300]);
    }

    playAlarmSound();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          await createSOS(uid, latitude, longitude);
          const contacts = await notifyContacts(uid);
          await sendEmergencyAlerts(uid, latitude, longitude);
          await updateLiveLocation(uid, latitude, longitude, accuracy);

          setLastLocation({ latitude, longitude, accuracy });
          setNotifiedCount(contacts.length);

          if (watchRef.current !== null) {
            navigator.geolocation.clearWatch(watchRef.current);
          }

          watchRef.current = navigator.geolocation.watchPosition(
            async (livePosition) => {
              const coords = livePosition.coords;
              await updateLiveLocation(
                uid,
                coords.latitude,
                coords.longitude,
                coords.accuracy
              );
              setLastLocation({
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy,
              });
            },
            (error) => {
              console.error(error);
              toast.error("Live tracking update failed");
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0,
            }
          );

          setCountdown(null);
          stateRef.current = "active";
          setState("active");
          toast.success(`${contacts.length} emergency contact(s) notified`);
        } catch (error) {
          console.error(error);
          stateRef.current = "failed";
          setState("failed");
          toast.error("Failed to send SOS");
        }
      },
      (error) => {
        console.error(error);
        setCountdown(null);
        stateRef.current = "failed";
        setState("failed");
        toast.error("Location permission denied");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );
  }, []);

  const startSOS = useCallback(() => {
    if (stateRef.current === "countdown" || stateRef.current === "sending") return;

    let count = 5;
    stateRef.current = "countdown";
    setCountdown(count);
    setNotifiedCount(null);
    setState("countdown");

    timerRef.current = window.setInterval(() => {
      count -= 1;

      if (count > 0) {
        setCountdown(count);
        return;
      }

      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      void sendSOS();
    }, 1000);
  }, [sendSOS]);

  return {
    countdown,
    lastLocation,
    notifiedCount,
    resetCountdown,
    startSOS,
    state,
  };
}

export function SOSFlowProvider({ children }: { children: ReactNode }) {
  const sosFlow = useSOSFlow();

  return createElement(SOSFlowContext.Provider, { value: sosFlow }, children);
}

export function useSOSController() {
  const context = useContext(SOSFlowContext);

  if (!context) {
    throw new Error("useSOSController must be used inside SOSFlowProvider");
  }

  return context;
}
