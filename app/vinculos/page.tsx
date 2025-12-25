"use client";

import { useEffect, useState } from "react";

type Exam = { id: string; name: string };
type Topic = { id: string; title: string; discipline?: { name: string } };

type Link = {
  id: string;
  examId: string;
  topicId: string;
  coverage: string;
  examImportance: number;
  notes: string | null;
  exam?: Exam;
  topic?: Topic;
};

const coverages = [
  { value: "INTEGRAL", label: "Integral" },
  { value: "PARTIAL", label: "Parcial" }
];

export default function VinculosPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [form, setForm] = useState({
    id: "",
    examId: "",
    topicId: "",
    coverage: "INTEGRAL",
    examImportance: "3",
    notes: ""
  });
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const [linksRes, examsRes, topicsRes] = await Promise.all([
      fetch("/api/exam-topics"),
      fetch("/api/exams"),
      fetch("/api/topics")
    ]);
    const linksData = await linksRes.json();
    const examsData = await examsRes.json();
    const topicsData = await topicsRes.json();
    setLinks(linksData);
    setExams(examsData);
    setTopics(topicsData);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm({
      id: "",
      examId: "",
      topicId: "",
      coverage: "INTEGRAL",
      examImportance: "3",
      notes: ""
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const payload = {
      id: form.id || undefined,
      examId: form.examId,
      topicId: form.topicId,
      coverage: form.coverage,
      examImportance: Number(form.examImportance),
      notes: form.notes || null
    };

    const method = form.id ? "PUT" : "POST";
    const response = await fetch("/api/exam-topics", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      setMessage(error.message || "Erro ao salvar vínculo.");
      return;
    }

    reset();
    await load();
  };

  const edit = (item: Link) => {
    setForm({
      id: item.id,
      examId: item.examId,
      topicId: item.topicId,
      coverage: item.coverage,
      examImportance: String(item.examImportance),
      notes: item.notes || ""
    });
  };

  const remove = async (id: string) => {
    setMessage(null);
    const response = await fetch(`/api/exam-topics?id=${id}`, { method: "DELETE" });
    if (!response.ok) {
      const error = await response.json();
      setMessage(error.message || "Erro ao remover vínculo.");
      return;
    }
    await load();
  };

  return (
    <main>
      <h1>Vínculos Edital ↔ Tópico</h1>
      <p>Relacione tópicos aos editais e defina cobertura.</p>

      <form onSubmit={submit} style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <label>
            Edital
            <select
              value={form.examId}
              onChange={(event) => setForm((prev) => ({ ...prev, examId: event.target.value }))}
              required
            >
              <option value="">Selecione</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Tópico
            <select
              value={form.topicId}
              onChange={(event) => setForm((prev) => ({ ...prev, topicId: event.target.value }))}
              required
            >
              <option value="">Selecione</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title} {topic.discipline?.name ? `(${topic.discipline.name})` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Cobertura
            <select
              value={form.coverage}
              onChange={(event) => setForm((prev) => ({ ...prev, coverage: event.target.value }))}
            >
              {coverages.map((coverage) => (
                <option key={coverage.value} value={coverage.value}>
                  {coverage.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Importância no edital (1 a 5)
            <input
              type="number"
              min={1}
              max={5}
              value={form.examImportance}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, examImportance: event.target.value }))
              }
            />
          </label>
        </div>
        <div>
          <label>
            Observações
            <textarea
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
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

      <h2>Vínculos cadastrados</h2>
      <ul>
        {links.map((item) => (
          <li key={item.id} style={{ marginBottom: "0.75rem" }}>
            <strong>{item.exam?.name || "Edital"}</strong> ↔ {item.topic?.title || "Tópico"}
            <div>
              Cobertura: {item.coverage} • Importância {item.examImportance}
            </div>
            {item.notes && <div>Obs.: {item.notes}</div>}
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
