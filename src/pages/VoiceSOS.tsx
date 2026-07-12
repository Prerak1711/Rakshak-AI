import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Mic,
  MicOff,
  Radio,
  ShieldAlert,
  Siren,
} from "lucide-react";

import { AppButton } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusIndicator } from "../components/ui/StatusIndicator";
import { useSOSFlow } from "../hooks/useSOSFlow";

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

function getSpeechRecognitionConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function detectKeyword(transcript: string) {
  const normalizedTranscript = transcript.toLowerCase();
  return KEYWORDS.find((keyword) => normalizedTranscript.includes(keyword));
}

function formatKeyword(keyword: string | null) {
  return keyword ? keyword.toUpperCase() : "None";
}

const VoiceSOS = () => {
  const {
    countdown,
    lastLocation,
    notifiedCount,
    resetCountdown,
    startSOS,
    state,
  } = useSOSFlow();
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const manualStopRef = useRef(true);
  const triggeredByVoiceRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [speech, setSpeech] = useState("");
  const [detectedKeyword, setDetectedKeyword] = useState<string | null>(null);
  const [error, setError] = useState("");

  const SpeechRecognitionClass = useMemo(getSpeechRecognitionConstructor, []);
  const isSupported = Boolean(SpeechRecognitionClass);
  const emergencyStatus =
    state === "countdown"
      ? `Countdown ${countdown ?? ""}`.trim()
      : state === "sending"
      ? "Triggering SOS"
      : state === "active"
      ? "Emergency Active"
      : state === "failed"
      ? "Failed"
      : "Ready";

  useEffect(() => {
    if (!SpeechRecognitionClass) {
      setError("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }

      const trimmedTranscript = transcript.trim();
      if (!trimmedTranscript) return;

      setSpeech(trimmedTranscript);

      const keyword = detectKeyword(trimmedTranscript);
      if (!keyword || triggeredByVoiceRef.current) return;

      triggeredByVoiceRef.current = true;
      setDetectedKeyword(keyword);
      startSOS();
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        manualStopRef.current = true;
        setIsListening(false);
        setError("Microphone permission was denied. Allow microphone access to use Voice SOS.");
        return;
      }

      setError(`Voice recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (manualStopRef.current) return;

      restartTimerRef.current = window.setTimeout(() => {
        try {
          recognition.start();
          setIsListening(true);
          setError("");
        } catch (startError) {
          console.error(startError);
        }
      }, 450);
    };

    recognitionRef.current = recognition;

    return () => {
      manualStopRef.current = true;
      if (restartTimerRef.current !== null) {
        window.clearTimeout(restartTimerRef.current);
      }
      recognition.stop();
    };
  }, [SpeechRecognitionClass, startSOS]);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError("Voice recognition is not supported in this browser.");
      return;
    }

    try {
      manualStopRef.current = false;
      setError("");
      recognitionRef.current.start();
      setIsListening(true);
    } catch (startError) {
      console.error(startError);
    }
  };

  const stopListening = () => {
    manualStopRef.current = true;
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
    }
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const triggerManualSOS = () => {
    setDetectedKeyword("manual");
    startSOS();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
      <PageHeader
        eyebrow="Voice Trigger"
        title="Voice SOS"
        description="Hands-free emergency detection that starts the same SOS countdown, alerts, and live tracking flow."
        actions={
          <Badge variant={isListening ? "red" : "amber"}>
            {isListening ? "Listening" : "Standby"}
          </Badge>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="relative overflow-hidden p-6 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(239,68,68,0.2),transparent_48%)]" />
          <div className="relative flex flex-col items-center text-center">
            <div
              className={`mb-7 grid h-28 w-28 place-items-center rounded-full border border-red-400/30 bg-red-500/10 text-red-200 shadow-[0_0_70px_rgba(220,38,38,0.35)] sm:h-36 sm:w-36 ${
                isListening ? "animate-pulse" : ""
              }`}
            >
              <Mic size={58} />
            </div>

            <h2 className="text-2xl font-black text-white sm:text-3xl">Voice SOS</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Say help, emergency, save me, police, ambulance, danger, or fire to
              begin the existing SOS flow automatically.
            </p>

            <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
              <AppButton
                type="button"
                size="lg"
                disabled={!isSupported || isListening}
                onClick={startListening}
              >
                <Mic size={20} />
                Start Listening
              </AppButton>
              <AppButton
                type="button"
                variant="secondary"
                size="lg"
                disabled={!isListening}
                onClick={stopListening}
              >
                <MicOff size={20} />
                Stop Listening
              </AppButton>
              <AppButton
                type="button"
                variant="danger"
                size="lg"
                disabled={state === "countdown" || state === "sending"}
                onClick={triggerManualSOS}
              >
                <Siren size={20} />
                Trigger SOS Manually
              </AppButton>
            </div>

            {state === "countdown" ? (
              <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4">
                <p className="text-lg font-bold text-white">
                  SOS sends in {countdown} second{countdown === 1 ? "" : "s"}
                </p>
                <AppButton
                  type="button"
                  variant="secondary"
                  className="mt-3"
                  onClick={resetCountdown}
                >
                  Cancel countdown
                </AppButton>
              </div>
            ) : null}

            {error ? (
              <div className="mt-6 flex max-w-2xl items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-left text-sm text-amber-100">
                <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                <p>{error}</p>
              </div>
            ) : null}
          </div>
        </Card>

        <div className="grid gap-4">
          <StatusIndicator
            label="Status"
            value={isListening ? "Listening..." : "Stopped"}
            tone={isListening ? "danger" : "neutral"}
          />
          <StatusIndicator
            label="Detected keyword"
            value={formatKeyword(detectedKeyword)}
            tone={detectedKeyword ? "danger" : "neutral"}
          />
          <StatusIndicator
            label="Emergency status"
            value={emergencyStatus}
            tone={state === "active" ? "danger" : state === "failed" ? "warning" : "safe"}
          />

          <Card>
            <div className="flex items-start gap-3">
              <Radio className="mt-1 text-red-300" size={22} />
              <div className="min-w-0">
                <h2 className="font-bold text-white">Live Speech</h2>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                  You said:
                </p>
                <p className="mt-2 min-h-16 break-words rounded-xl bg-white/[0.03] p-3 text-sm leading-6 text-slate-200">
                  {speech ? `"${speech}"` : "Waiting for speech..."}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              {state === "active" ? (
                <CheckCircle2 className="mt-1 text-emerald-300" size={22} />
              ) : (
                <ShieldAlert className="mt-1 text-red-300" size={22} />
              )}
              <div className="min-w-0">
                <h2 className="font-bold text-white">Emergency workflow</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Voice detection calls the same SOS function as the emergency
                  button, including countdown, Firestore writes, live GPS
                  tracking, contacts, and alarm.
                </p>
                <div className="mt-4 grid gap-2 text-sm text-slate-400">
                  <p>Contacts notified: {notifiedCount ?? "Pending"}</p>
                  <p>
                    Live tracking: {lastLocation ? "Streaming" : "Not started"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default VoiceSOS;
