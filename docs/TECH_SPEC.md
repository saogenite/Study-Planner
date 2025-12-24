Especificação Técnica v1.0
1) Arquitetura

Next.js (App Router) + TypeScript

Postgres + Prisma

Auth (Auth.js ou equivalente)

PWA (instalável)

IA plugável via interface LLMProvider (importação de edital e diagnósticos posteriormente)

2) Principais serviços

PlanService: gera plano semanal/ciclo

TrailService: mantém estado da trilha por tópico (próximo passo, próxima data, foco)

SessionService: cria sessão pendente (timer), categoriza sessão, atualiza métricas e trilha

SyllabusImportService (v1.1): extrai texto e chama IA para gerar JSON
