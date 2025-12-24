"use client";

import { useEffect, useState } from "react";

type Discipline = {
  id: string;
  name: string;
  basePriority: number;
};

export default function DisciplinasPage() {
  const [items, setItems] = useState<Discipline[]>([]);
  const [form, setForm] = useState({ id: "", name: "", basePriority: "3" });
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch("/api/disciplines");
    const data = await response.json();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm({ id: "", name: "", basePriority: "3" });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const payload = {
      id: form.id || undefined,
      name: form.name,
      basePriority: Number(form.basePriority)
    };

    const method = form.id ? "PUT" : "POST";
    const response = await fetch("/api/disciplines", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      setMessage(error.message || "Erro ao salvar disciplina.");
      return;
    }

    reset();
    await load();
  };

  const edit = (item: Discipline) => {
    setForm({
      id: item.id,
      name: item.name,
      basePriority: String(item.basePriority)
    });
  };

  const remove = async (id: string) => {
    setMessage(null);
    const response = await fetch(`/api/disciplines?id=${id}`, { method: "DELETE" });
    if (!response.ok) {
      const error = await response.json();
      setMessage(error.message || "Erro ao remover disciplina.");
      return;
    }
    await load();
  };

  return (
    <main>
      <h1>Disciplinas</h1>
      <p>Organize as disciplinas usadas nos tópicos.</p>

      <form onSubmit={submit} style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <label>
            Nome da disciplina
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
            Prioridade base (1 a 5)
            <input
              type="number"
              min={1}
              max={5}
              value={form.basePriority}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, basePriority: event.target.value }))
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

      <h2>Lista de disciplinas</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: "0.75rem" }}>
            <strong>{item.name}</strong> — Prioridade {item.basePriority}
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
