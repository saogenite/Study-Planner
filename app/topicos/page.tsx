"use client";

import { useEffect, useMemo, useState } from "react";

type Discipline = {
  id: string;
  name: string;
};

type Topic = {
  id: string;
  title: string;
  disciplineId: string;
  parentId: string | null;
  difficulty: number;
  personalPriority: number;
  discipline?: Discipline;
  parent?: { id: string; title: string } | null;
};

export default function TopicosPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [form, setForm] = useState({
    id: "",
    title: "",
    disciplineId: "",
    parentId: "",
    difficulty: "3",
    personalPriority: "3"
  });
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const [topicsRes, disciplinesRes] = await Promise.all([
      fetch("/api/topics"),
      fetch("/api/disciplines")
    ]);
    const topicsData = await topicsRes.json();
    const disciplinesData = await disciplinesRes.json();
    setTopics(topicsData);
    setDisciplines(disciplinesData);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm({
      id: "",
      title: "",
      disciplineId: "",
      parentId: "",
      difficulty: "3",
      personalPriority: "3"
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const payload = {
      id: form.id || undefined,
      title: form.title,
      disciplineId: form.disciplineId,
      parentId: form.parentId || null,
      difficulty: Number(form.difficulty),
      personalPriority: Number(form.personalPriority)
    };

    const method = form.id ? "PUT" : "POST";
    const response = await fetch("/api/topics", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      setMessage(error.message || "Erro ao salvar tópico.");
      return;
    }

    reset();
    await load();
  };

  const edit = (item: Topic) => {
    setForm({
      id: item.id,
      title: item.title,
      disciplineId: item.disciplineId,
      parentId: item.parentId || "",
      difficulty: String(item.difficulty),
      personalPriority: String(item.personalPriority)
    });
  };

  const remove = async (id: string) => {
    setMessage(null);
    const response = await fetch(`/api/topics?id=${id}`, { method: "DELETE" });
    if (!response.ok) {
      const error = await response.json();
      setMessage(error.message || "Erro ao remover tópico.");
      return;
    }
    await load();
  };

  const parentOptions = useMemo(() => topics.filter((item) => item.id !== form.id), [
    topics,
    form.id
  ]);

  return (
    <main>
      <h1>Tópicos</h1>
      <p>Cadastre tópicos e subtópicos para cada disciplina.</p>

      <form onSubmit={submit} style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <label>
            Título do tópico
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Disciplina
            <select
              value={form.disciplineId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, disciplineId: event.target.value }))
              }
              required
            >
              <option value="">Selecione</option>
              {disciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Tópico pai (opcional)
            <select
              value={form.parentId}
              onChange={(event) => setForm((prev) => ({ ...prev, parentId: event.target.value }))}
            >
              <option value="">Sem pai</option>
              {parentOptions.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Dificuldade (1 a 5)
            <input
              type="number"
              min={1}
              max={5}
              value={form.difficulty}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, difficulty: event.target.value }))
              }
            />
          </label>
        </div>
        <div>
          <label>
            Prioridade pessoal (1 a 5)
            <input
              type="number"
              min={1}
              max={5}
              value={form.personalPriority}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, personalPriority: event.target.value }))
              }
            />
          </label>
        </div>
        <button type="submit">{form.id ? "Atualizar" : "Cadastrar"}</button>
        {form.id && (
          <button type="button" onClick={reset} style={{ marginLeft: "0.5rem" }}>
            Cancelar edição
          </button>
        )}
      </form>

      {message && <p style={{ color: "crimson" }}>{message}</p>}

      <h2>Lista de tópicos</h2>
      <ul>
        {topics.map((item) => (
          <li key={item.id} style={{ marginBottom: "0.75rem" }}>
            <strong>{item.title}</strong> — {item.discipline?.name || "Disciplina"}
            {item.parent?.title ? ` — Pai: ${item.parent.title}` : ""}
            <div>
              <span>
                Dificuldade {item.difficulty} • Prioridade {item.personalPriority}
              </span>
            </div>
            <div>
              <button type="button" onClick={() => edit(item)}>
                Editar
              </button>
              <button
                type="button"
                onClick={() => remove(item.id)}
                style={{ marginLeft: "0.5rem" }}
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
