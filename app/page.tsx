export default function Home() {
  return (
    <main>
      <h1>Study Planner</h1>
      <p>Escolha um módulo para começar o cadastro.</p>
      <ul>
        <li>
          <a href="/timer">Timer</a>
        </li>
        <li>
          <a href="/sessoes/pendentes">Sessões pendentes</a>
        </li>
        <li>
          <a href="/editais">Editais</a>
        </li>
        <li>
          <a href="/disciplinas">Disciplinas</a>
        </li>
        <li>
          <a href="/topicos">Tópicos</a>
        </li>
        <li>
          <a href="/vinculos">Vínculos Edital ↔ Tópico</a>
        </li>
      </ul>
    </main>
  );
}
