"use client";

import { useMemo, useState } from "react";
import { formatTime, useTimer } from "@/components/timer-context";

const presets = [25, 50, 60, 90];

export default function TimerPage() {
  const timer = useTimer();
  const [mode, setMode] = useState<"PRESET" | "MANUAL">("PRESET");
  const [presetMinutes, setPresetMinutes] = useState(50);
  const [manualMinutes, setManualMinutes] = useState("30");
  const [message, setMessage] = useState<string | null>(null);

  const durationMin = useMemo(() => {
    return mode === "PRESET" ? presetMinutes : Number(manualMinutes || 0);
  }, [mode, presetMinutes, manualMinutes]);

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

    timer.start(mode, durationMin);
  };

  const togglePause = () => {
    timer.togglePause();
  };

  const finish = async () => {
    const result = await timer.finish();
    setMessage(result.message);
  };

  return (
    <main>
      <h1>Cronômetro</h1>
      <p>Selecione um preset ou defina minutos manuais.</p>

      <section style={{ marginTop: "1.25rem" }}>
        <h2>Tempo restante</h2>
        <p style={{ fontSize: "2rem", marginTop: "0.5rem" }}>
          {formatTime(timer.remainingSeconds)}
        </p>
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
        {!timer.running && (
          <button type="button" onClick={start}>
            Iniciar
          </button>
        )}
        {timer.running && (
          <>
            <button type="button" onClick={togglePause}>
              {timer.paused ? "Retomar" : "Pausar"}
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
