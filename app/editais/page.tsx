"use client";

import { useEffect, useState } from "react";

type Exam = {
  id: string;
  name: string;
  status: string;
  priorityWeight: number;
  examDate: string | null;
};

const statuses = [
  { value: "FOCUS", label: "Foco" },
  { value: "ACTIVE", label: "Ativo" },
  { value: "PAUSED", label: "Pausado" }
];

export default function EditaisPage() {
  const [items, setItems] = useState<Exam[]>([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    status: "ACTIVE",
    priorityWeight: "60",
    examDate: ""
  });
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch("/api/exams");
    const data = await response.json();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm({ id: "", name: "", status: "ACTIVE", priorityWeight: "60", examDate: "" });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const payload = {
      id: form.id || undefined,
      name: form.name,
      status: form.status,
      priorityWeight: Number(form.priorityWeight),
      examDate: form.examDate || null
    };

    const method = form.id ? "PUT" : "POST";
    const response = await fetch("/api/exams", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      setMessage(error.message || "Erro ao salvar edital.");
      return;
    }

    reset();
    await load();
  };

  const edit = (item: Exam) => {
    setForm({
      id: item.id,
      name: item.name,
      status: item.status,
      priorityWeight: String(item.priorityWeight),
      examDate: item.examDate ? item.examDate.slice(0, 10) : ""
    });
  };

  const remove = async (id: string) => {
    setMessage(null);
    const response = await fetch(`/api/exams?id=${id}`, { method: "DELETE" });
    if (!response.ok) {
      const error = await response.json();
      setMessage(error.message || "Erro ao remover edital.");
      return;
    }
    await load();
  };

  return (
    <main>
      <h1>Editais</h1>
      <p>Gerencie editais e status de foco.</p>

      <form onSubmit={submit} style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <label>
            Nome do edital
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Peso de prioridade
            <input
              type="number"
              min={1}
              max={100}
              value={form.priorityWeight}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, priorityWeight: event.target.value }))
              }
            />
          </label>
        </div>
        <div>
          <label>
            Data da prova (opcional)
            <input
              type="date"
              value={form.examDate}
              onChange={(event) => setForm((prev) => ({ ...prev, examDate: event.target.value }))}
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

      <h2>Lista de editais</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: "0.75rem" }}>
            <strong>{item.name}</strong> — {item.status} — Peso {item.priorityWeight}
            {item.examDate && ` — Prova: ${item.examDate.slice(0, 10)}`}
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
