import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useSOSController } from "./useSOSFlow";

type SpeechRecognitionResultItem = {
  transcript: string;
};

type SpeechRecognitionAlternativeList = {
  readonly length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
};

type SpeechRecognitionResultListLike = {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternativeList;
  [index: number]: SpeechRecognitionAlternativeList;
};

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
};

type SpeechRecognitionErrorEventLike = Event & {
  error: string;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type VoiceSOSStatus =
  | "disabled"
  | "error"
  | "idle"
  | "listening"
  | "triggered"
  | "unsupported";

type VoiceSOSValue = {
  detectedKeyword: string | null;
  enabled: boolean;
  error: string;
  isSupported: boolean;
  setEnabled: (enabled: boolean) => void;
  status: VoiceSOSStatus;
  transcript: string;
};

const VOICE_SOS_STORAGE_KEY = "rakshak_voice_sos_enabled";
const KEYWORDS = [
  "help me",
  "save me",
  "emergency",
  "ambulance",
  "danger",
  "police",
  "help",
  "fire",
] as const;

const VoiceSOSContext = createContext<VoiceSOSValue | null>(null);

function getInitialEnabled() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(VOICE_SOS_STORAGE_KEY) !== "false";
}

function getSpeechRecognitionConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function detectKeyword(transcript: string) {
  const normalizedTranscript = transcript.toLowerCase();
  return KEYWORDS.find((keyword) => normalizedTranscript.includes(keyword)) ?? null;
}

export function VoiceSOSProvider({ children }: { children: ReactNode }) {
  const { startSOS, state } = useSOSController();
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const manualStopRef = useRef(true);
  const restartTimerRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);

  const [enabled, setEnabledState] = useState(getInitialEnabled);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [detectedKeyword, setDetectedKeyword] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");

  const SpeechRecognitionClass = useMemo(getSpeechRecognitionConstructor, []);
  const isSupported = Boolean(SpeechRecognitionClass);

  const stopRecognition = useCallback(() => {
    manualStopRef.current = true;
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || !enabled || !isSupported) return;

    try {
      manualStopRef.current = false;
      recognitionRef.current.start();
      setIsListening(true);
      setError("");
    } catch (startError) {
      console.error(startError);
    }
  }, [enabled, isSupported]);

  const setEnabled = useCallback(
    (nextEnabled: boolean) => {
      window.localStorage.setItem(VOICE_SOS_STORAGE_KEY, String(nextEnabled));
      setEnabledState(nextEnabled);

      if (!nextEnabled) {
        stopRecognition();
        setError("");
      }
    },
    [stopRecognition]
  );

  useEffect(() => {
    if (!isSupported) {
      setError("Voice recognition is not supported in this browser.");
      return;
    }

    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let liveTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        liveTranscript += event.results[index][0].transcript;
      }

      const trimmedTranscript = liveTranscript.trim();
      if (!trimmedTranscript) return;

      setTranscript(trimmedTranscript);

      const keyword = detectKeyword(trimmedTranscript);
      if (!keyword || triggeredRef.current) return;

      triggeredRef.current = true;
      setDetectedKeyword(keyword);
      startSOS();
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        manualStopRef.current = true;
        setIsListening(false);
        setError("Microphone permission was denied. Enable microphone access to use Voice SOS.");
        return;
      }

      setError(`Voice recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (manualStopRef.current || !enabled || triggeredRef.current) return;

      restartTimerRef.current = window.setTimeout(() => {
        startRecognition();
      }, 450);
    };

    recognitionRef.current = recognition;

    if (enabled) {
      startRecognition();
    }

    return () => {
      stopRecognition();
    };
  }, [
    SpeechRecognitionClass,
    enabled,
    isSupported,
    startRecognition,
    startSOS,
    stopRecognition,
  ]);

  useEffect(() => {
    if (!enabled) {
      stopRecognition();
      return;
    }

    if (isSupported) {
      startRecognition();
    }
  }, [enabled, isSupported, startRecognition, stopRecognition]);

  useEffect(() => {
    if (state === "idle" || state === "failed") {
      triggeredRef.current = false;
    }
  }, [state]);

  const status: VoiceSOSStatus = !enabled
    ? "disabled"
    : !isSupported
    ? "unsupported"
    : error
    ? "error"
    : triggeredRef.current
    ? "triggered"
    : isListening
    ? "listening"
    : "idle";

  const value: VoiceSOSValue = {
    detectedKeyword,
    enabled,
    error,
    isSupported,
    setEnabled,
    status,
    transcript,
  };

  return createElement(VoiceSOSContext.Provider, { value }, children);
}

export function useVoiceSOS() {
  const context = useContext(VoiceSOSContext);

  if (!context) {
    throw new Error("useVoiceSOS must be used inside VoiceSOSProvider");
  }

  return context;
}
