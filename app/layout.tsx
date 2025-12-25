import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Study Planner",
  description: "Study Planner app scaffold"
};

const links = [
  { href: "/", label: "Início" },
  { href: "/timer", label: "Timer" },
  { href: "/sessoes/pendentes", label: "Pendentes" },
  { href: "/editais", label: "Editais" },
  { href: "/disciplinas", label: "Disciplinas" },
  { href: "/topicos", label: "Tópicos" },
  { href: "/vinculos", label: "Vínculos" }
];

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <header style={{ marginBottom: "1.5rem" }}>
          <nav>
            <ul style={{ display: "flex", gap: "1rem", listStyle: "none", padding: 0 }}>
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
