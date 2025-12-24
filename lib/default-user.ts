import { prisma } from "./prisma";

export async function getDefaultUserId() {
  const existing = await prisma.user.findFirst({
    select: { id: true }
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.user.create({
    data: {
      email: "demo@studyplanner.local",
      settings: {
        create: {}
      }
    },
    select: { id: true }
  });

  return created.id;
}
