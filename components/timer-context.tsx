"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import Link from "next/link";

const STORAGE_KEY = "study-planner:timer";

type TimerMode = "PRESET" | "MANUAL";

type TimerState = {
  running: boolean;
  paused: boolean;
  mode: TimerMode;
  durationMin: number;
  startedAtTimestamp: number | null;
  endAtTimestamp: number | null;
  remainingSeconds: number;
};

type TimerContextValue = TimerState & {
  start: (mode: TimerMode, durationMin: number) => void;
  togglePause: () => void;
  finish: () => Promise<{ ok: boolean; message: string }>;
  reset: () => void;
};

const defaultState: TimerState = {
  running: false,
  paused: false,
  mode: "PRESET",
  durationMin: 0,
  startedAtTimestamp: null,
  endAtTimestamp: null,
  remainingSeconds: 0
};

const TimerContext = createContext<TimerContextValue | null>(null);

function readStorage(): TimerState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed
    };
  } catch {
    return defaultState;
  }
}

function writeStorage(state: TimerState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>(defaultState);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = readStorage();
    if (stored.running) {
      if (!stored.paused && stored.endAtTimestamp) {
        const remaining = Math.max(
          0,
          Math.floor((stored.endAtTimestamp - Date.now()) / 1000)
        );
        stored.remainingSeconds = remaining;
        if (remaining === 0) {
          stored.running = false;
        }
      }
    }
    setState(stored);
  }, []);

  useEffect(() => {
    if (!state.running || state.paused) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setState((prev) => {
        if (!prev.endAtTimestamp) {
          return prev;
        }
        const remaining = Math.max(
          0,
          Math.floor((prev.endAtTimestamp - Date.now()) / 1000)
        );
        if (remaining === 0) {
          return {
            ...prev,
            running: false,
            paused: false,
            remainingSeconds: 0,
            endAtTimestamp: null
          };
        }
        return { ...prev, remainingSeconds: remaining };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.running, state.paused]);

  useEffect(() => {
    writeStorage(state);
  }, [state]);

  useEffect(() => {
    const handleStorage = () => {
      const stored = readStorage();
      setState(stored);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const start = useCallback((mode: TimerMode, durationMin: number) => {
    const now = Date.now();
    const remainingSeconds = durationMin * 60;
    setState({
      running: true,
      paused: false,
      mode,
      durationMin,
      startedAtTimestamp: now,
      endAtTimestamp: now + remainingSeconds * 1000,
      remainingSeconds
    });
  }, []);

  const togglePause = useCallback(() => {
    setState((prev) => {
      if (!prev.running) {
        return prev;
      }
      if (prev.paused) {
        const now = Date.now();
        const remainingSeconds = prev.remainingSeconds || prev.durationMin * 60;
        return {
          ...prev,
          paused: false,
          endAtTimestamp: now + remainingSeconds * 1000,
          remainingSeconds
        };
      }
      const remainingSeconds = prev.endAtTimestamp
        ? Math.max(0, Math.floor((prev.endAtTimestamp - Date.now()) / 1000))
        : prev.remainingSeconds;
      return {
        ...prev,
        paused: true,
        endAtTimestamp: null,
        remainingSeconds
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState(defaultState);
  }, []);

  const finish = useCallback(async () => {
    if (!state.running || !state.startedAtTimestamp) {
      return { ok: false, message: "Inicie o cronômetro antes de finalizar." };
    }

    const payload = {
      startedAt: new Date(state.startedAtTimestamp).toISOString(),
      endedAt: new Date().toISOString(),
      durationMin: state.durationMin,
      timerSource: state.mode
    };

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage = `Erro ao registrar a sessão (status ${response.status}).`;

        if (responseText) {
          try {
            const parsed = JSON.parse(responseText);
            errorMessage = parsed.message || errorMessage;
          } catch {
            errorMessage = responseText;
          }
        }

        return { ok: false, message: errorMessage };
      }

      let successMessage = "Sessão registrada como pendente.";
      try {
        const data = await response.json();
        if (data?.message) {
          successMessage = data.message;
        }
      } catch {
        // ignore
      }

      setState(defaultState);
      window.dispatchEvent(new Event("studyplanner:sessions-updated"));

      return { ok: true, message: successMessage };
    } catch (error) {
      console.error(error);
      return { ok: false, message: "Erro ao registrar a sessão." };
    }
  }, [state]);

  const value = useMemo(
    () => ({
      ...state,
      start,
      togglePause,
      finish,
      reset
    }),
    [state, start, togglePause, finish, reset]
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer deve ser usado dentro de TimerProvider");
  }
  return context;
}

export function TimerWidget() {
  const { running, paused, remainingSeconds, togglePause, finish } = useTimer();

  if (!running) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        right: "1.5rem",
        bottom: "1.5rem",
        background: "rgba(15, 23, 42, 0.9)",
        border: "1px solid #334155",
        padding: "0.75rem 1rem",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        zIndex: 50
      }}
    >
      <Link href="/timer" style={{ color: "inherit", textDecoration: "none" }}>
        <strong>{formatTime(remainingSeconds)}</strong>
      </Link>
      <button type="button" onClick={togglePause} style={{ fontSize: "0.85rem" }}>
        {paused ? "Retomar" : "Pausar"}
      </button>
      <button type="button" onClick={finish} style={{ fontSize: "0.85rem" }}>
        Finalizar
      </button>
    </div>
  );
}

export { formatTime };
