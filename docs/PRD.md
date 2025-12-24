PRD v1.0 — Study Planner (Web/PWA, multi-editais)
1) Objetivo do produto

Construir um aplicativo web/PWA para planejamento e execução de estudos por edital, com:

Multi-editais simultâneos, com 1 edital definido como foco principal.

Banco indexado de tópicos (Disciplina → Tópico → Subtópico), mapeado aos editais.

Timer regressivo (presets + minutos livres) que registra sessões automaticamente.

Planejamento por ciclo/semana que define, para cada tópico, o foco da sessão (Lei seca, Jurisprudência, Doutrina, Cards, Questões).

Método estruturado: o mesmo tópico retorna em dias subsequentes com focos alternados (trilhas), para dar sensação real de “estar tocando em tudo” com consistência.

2) Escopo do MVP
Inclui

CRUD: Editais, Disciplinas, Tópicos (hierárquicos), Mapa Edital↔Tópico

Timer regressivo:

presets (25/50/60/90)

minutos manuais (ex.: 37, 68, 112)

finalização gera Sessão PENDENTE

Sessões:

fila de pendentes

categorização rápida: Tópico + Foco + (opcional: qualidade/performance)

Planejador semanal / próximo ciclo:

gera lista de itens com Foco e Duração sugerida

alterna tópicos (interleaving simples)

respeita edital foco

Trilhas por tópico (método):

ao estudar um tópico, o app agenda retornos com focos diferentes (ex.: Lei seca → Cards → Juris → Questões → Cards…)

Não inclui (v1)

Notificações avançadas em background no iOS (pode evoluir depois)

Planner com calendário horário detalhado (v1 é por “blocos”)

Banco interno completo de artigos (vamos estruturar o módulo; conteúdo pode ser incrementado depois)

3) Conceitos de domínio

Foco da sessão (obrigatório no plano; opcional na sessão até o usuário preencher):
LEI_SECA | JURISPRUDENCIA | DOUTRINA | CARDS | QUESTOES

Trilha de tópico: sequência de “toques” programados no tempo, cada toque com foco e duração sugerida.

Edital foco: guia o peso das sugestões; editais secundários entram como bônus (sem dominar o planejamento).

4) User stories (principais)

Como usuário, quero cadastrar 3 editais e marcar 1 como foco, para que o app priorize o foco sem ignorar os outros.

Como usuário, quero iniciar um timer com minutos livres, para adaptar ao meu dia.

Como usuário, quero que ao terminar o timer seja criada uma sessão automaticamente e eu possa categorizar depois.

Como usuário, quero gerar um plano semanal em que cada item diga o foco (lei seca/juris/doutrina/cards/questões) e o motivo da sugestão.

Como usuário, quero que tópicos retornem automaticamente em dias futuros com focos alternados, para manter memória ativa e evitar “sumir com temas”.

5) Telas do MVP
Dashboard

Timer (atalho)

Pendências de categorização

Revisões vencidas (pela trilha)

Ação: “Gerar plano da semana”

Timer

Presets + campo manual (minutos)

Start/Pause/Finish

Ao finalizar: cria sessão PENDENTE e abre “checkout rápido”

Sessões

Lista geral

Aba “Pendentes”

Ação rápida: selecionar Tópico + Foco + Qualidade/Performance (opcional)

Plano da Semana / Próximo Ciclo

Cada item mostra:

Disciplina + Tópico

Editais: badges (com destaque do foco)

Foco da sessão (obrigatório)

Duração sugerida

Justificativa (ex.: “revisão vencida”, “baixo domínio”, “cobertura do foco”, “trilha — passo 2/6”)

Editais / Disciplinas / Tópicos

CRUD básico + mapeamento Edital↔Tópico.

6) Regras de método (trilhas + interleaving)
Trilha padrão (configurável)

Modelo inicial (padrão recomendado):

Passo 0 (D0): LEI_SECA (aquisição) — 40–60 min

Passo 1 (D+1): CARDS — 15–25 min

Passo 2 (D+4): JURISPRUDENCIA — 25–40 min

Passo 3 (D+8): QUESTOES — 25–40 min

Passo 4 (D+15): CARDS — 15–20 min

Passo 5 (D+30): QUESTOES (curta) — 20–30 min

Interleaving (variedade)

No plano semanal:

evitar repetir o mesmo tópico no mesmo dia

evitar 3 blocos seguidos da mesma disciplina (regra simples)

distribuir revisões vencidas ao longo da semana (em vez de concentrar em um dia)

7) Critérios de aceite (exemplos)

Timer aceita input manual (minutos) e finaliza criando sessão PENDENTE com durationMin correto.

Plano semanal sempre exibe um focus por item.

Ao concluir uma sessão categorizada, o estado da trilha do tópico avança e agenda o próximo toque.
