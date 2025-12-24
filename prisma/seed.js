const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
  where: { email: "seed@example.com" },
  update: {},
  create: {
    email: "seed@example.com",
    settings: { create: {} },
  },
});


  await prisma.trailTemplate.create({
    data: {
      userId: user.id,
      name: "Trilha Padrão",
      isDefault: true,
      steps: {
        create: [
          {
            stepIndex: 0,
            offsetDays: 0,
            focus: "LEI_SECA",
            minMinutes: 40,
            maxMinutes: 60,
            label: "Aquisição"
          },
          {
            stepIndex: 1,
            offsetDays: 1,
            focus: "CARDS",
            minMinutes: 15,
            maxMinutes: 25,
            label: "Revisão rápida"
          },
          {
            stepIndex: 2,
            offsetDays: 4,
            focus: "JURISPRUDENCIA",
            minMinutes: 25,
            maxMinutes: 40,
            label: "Revisão jurisprudencial"
          },
          {
            stepIndex: 3,
            offsetDays: 8,
            focus: "QUESTOES",
            minMinutes: 25,
            maxMinutes: 40,
            label: "Prática de questões"
          },
          {
            stepIndex: 4,
            offsetDays: 15,
            focus: "CARDS",
            minMinutes: 15,
            maxMinutes: 20,
            label: "Reforço"
          },
          {
            stepIndex: 5,
            offsetDays: 30,
            focus: "QUESTOES",
            minMinutes: 20,
            maxMinutes: 30,
            label: "Revisão final"
          }
        ]
      }
    }
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
