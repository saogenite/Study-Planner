"use client";

import { useEffect, useState } from "react";

type Topic = {
  id: string;
  title: string;
  discipline?: { name: string };
};

type Session = {
  id: string;
  startedAt: string;
  endedAt: string;
  durationMin: number;
  topicId: string | null;
  focus: string | null;
  qualityScore: number | null;
  notes: string | null;
  topic?: Topic | null;
};

const focuses = [
  { value: "LEI_SECA", label: "Lei seca" },
  { value: "JURISPRUDENCIA", label: "Jurisprudência" },
  { value: "DOUTRINA", label: "Doutrina" },
  { value: "CARDS", label: "Cards" },
  { value: "QUESTOES", label: "Questões" }
];

export default function SessoesPendentesPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const [sessionsRes, topicsRes] = await Promise.all([
      fetch("/api/sessions?status=PENDING"),
      fetch("/api/topics")
    ]);
    const sessionsData = await sessionsRes.json();
    const topicsData = await topicsRes.json();
    setSessions(sessionsData);
    setTopics(topicsData);
  };

  useEffect(() => {
    load();
  }, []);

  const updateSession = (id: string, data: Partial<Session>) => {
    setSessions((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
  };

  const save = async (session: Session) => {
    setMessage(null);

    if (!session.topicId || !session.focus) {
      setMessage("Selecione tópico e foco antes de salvar.");
      return;
    }

    const response = await fetch(`/api/sessions/${session.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topicId: session.topicId,
        focus: session.focus,
        qualityScore: session.qualityScore ?? null,
        notes: session.notes || null
      })
    });

    if (!response.ok) {
      const error = await response.json();
      setMessage(error.message || "Erro ao salvar sessão.");
      return;
    }

    await load();
  };

  return (
    <main>
      <h1>Sessões pendentes</h1>
      <p>Finalize a categorização das sessões criadas pelo timer.</p>

      {message && <p style={{ color: "crimson", marginTop: "1rem" }}>{message}</p>}

      <ul style={{ marginTop: "1.5rem" }}>
        {sessions.map((session) => (
          <li key={session.id} style={{ paddingBottom: "1rem" }}>
            <strong>Sessão de {session.durationMin} min</strong>
            <div>
              Início: {new Date(session.startedAt).toLocaleString("pt-BR")} — Fim: {" "}
              {new Date(session.endedAt).toLocaleString("pt-BR")}
            </div>

            <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.75rem" }}>
              <label>
                Tópico
                <select
                  value={session.topicId ?? ""}
                  onChange={(event) => updateSession(session.id, { topicId: event.target.value })}
                >
                  <option value="">Selecione</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title} {topic.discipline?.name ? `(${topic.discipline.name})` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Foco
                <select
                  value={session.focus ?? ""}
                  onChange={(event) => updateSession(session.id, { focus: event.target.value })}
                >
                  <option value="">Selecione</option>
                  {focuses.map((focus) => (
                    <option key={focus.value} value={focus.value}>
                      {focus.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Qualidade (0 a 5)
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={session.qualityScore ?? ""}
                  onChange={(event) =>
                    updateSession(session.id, {
                      qualityScore: event.target.value === "" ? null : Number(event.target.value)
                    })
                  }
                />
              </label>

              <label>
                Observações
                <textarea
                  value={session.notes ?? ""}
                  onChange={(event) => updateSession(session.id, { notes: event.target.value })}
                />
              </label>
            </div>

            <button type="button" style={{ marginTop: "0.75rem" }} onClick={() => save(session)}>
              Salvar categorização
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
