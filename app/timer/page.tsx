"use client";

import { useEffect, useMemo, useState } from "react";

const presets = [25, 50, 60, 90];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function TimerPage() {
  const [mode, setMode] = useState<"PRESET" | "MANUAL">("PRESET");
  const [presetMinutes, setPresetMinutes] = useState(50);
  const [manualMinutes, setManualMinutes] = useState("30");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const durationMin = useMemo(() => {
    return mode === "PRESET" ? presetMinutes : Number(manualMinutes || 0);
  }, [mode, presetMinutes, manualMinutes]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isRunning && !isPaused) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (isRunning && secondsLeft === 0) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const validateManual = () => {
    const value = Number(manualMinutes);
    if (!value || value < 1 || value > 240) {
      setMessage("Informe minutos entre 1 e 240.");
      return false;
    }
    return true;
  };

  const start = () => {
    setMessage(null);
    if (mode === "MANUAL" && !validateManual()) {
      return;
    }

    if (durationMin < 1 || durationMin > 240) {
      setMessage("Duração inválida para iniciar o cronômetro.");
      return;
    }

    setSecondsLeft(durationMin * 60);
    setIsRunning(true);
    setIsPaused(false);
    setStartedAt(new Date());
  };

  const togglePause = () => {
    if (!isRunning) {
      return;
    }
    setIsPaused((prev) => !prev);
  };

  const finish = async () => {
    if (!isRunning || !startedAt) {
      return;
    }

    setIsRunning(false);
    setIsPaused(false);

    const endedAt = new Date();
    const payload = {
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationMin,
      timerSource: mode
    };

    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      setMessage(error.message || "Erro ao registrar a sessão.");
      return;
    }

    setSecondsLeft(0);
    setStartedAt(null);
    setMessage("Sessão registrada como pendente.");
  };

  return (
    <main>
      <h1>Cronômetro</h1>
      <p>Selecione um preset ou defina minutos manuais.</p>

      <section style={{ marginTop: "1.25rem" }}>
        <h2>Tempo restante</h2>
        <p style={{ fontSize: "2rem", marginTop: "0.5rem" }}>{formatTime(secondsLeft)}</p>
      </section>

      <form style={{ marginTop: "1.5rem" }}>
        <div>
          <label>
            Modo
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as "PRESET" | "MANUAL")}
            >
              <option value="PRESET">Preset</option>
              <option value="MANUAL">Manual</option>
            </select>
          </label>
        </div>

        {mode === "PRESET" ? (
          <div>
            <label>
              Preset (minutos)
              <select
                value={presetMinutes}
                onChange={(event) => setPresetMinutes(Number(event.target.value))}
              >
                {presets.map((value) => (
                  <option key={value} value={value}>
                    {value} minutos
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div>
            <label>
              Minutos (1 a 240)
              <input
                type="number"
                min={1}
                max={240}
                value={manualMinutes}
                onChange={(event) => setManualMinutes(event.target.value)}
                onBlur={validateManual}
              />
            </label>
          </div>
        )}
      </form>

      <div style={{ marginTop: "1rem" }}>
        {!isRunning && (
          <button type="button" onClick={start}>
            Iniciar
          </button>
        )}
        {isRunning && (
          <>
            <button type="button" onClick={togglePause}>
              {isPaused ? "Retomar" : "Pausar"}
            </button>
            <button type="button" onClick={finish} style={{ marginLeft: "0.5rem" }}>
              Finalizar
            </button>
          </>
        )}
      </div>

      {message && <p style={{ marginTop: "1rem", color: "crimson" }}>{message}</p>}
    </main>
  );
}
