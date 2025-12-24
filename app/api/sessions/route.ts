import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/default-user";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const sessions = await prisma.studySession.findMany({
    where: status ? { status } : undefined,
    include: {
      topic: true
    },
    orderBy: {
      endedAt: "desc"
    }
  });

  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const durationMin = Number(body.durationMin || 0);
  const timerSource = body.timerSource === "PRESET" ? "PRESET" : "MANUAL";
  const startedAt = body.startedAt ? new Date(body.startedAt) : null;
  const endedAt = body.endedAt ? new Date(body.endedAt) : null;

  if (!durationMin || durationMin < 1) {
    return NextResponse.json(
      { message: "Duração inválida para a sessão." },
      { status: 400 }
    );
  }

  if (!startedAt || !endedAt) {
    return NextResponse.json(
      { message: "Datas de início e fim são obrigatórias." },
      { status: 400 }
    );
  }

  const userId = await getDefaultUserId();

  const session = await prisma.studySession.create({
    data: {
      userId,
      startedAt,
      endedAt,
      durationMin,
      timerSource,
      status: "PENDING"
    }
  });

  return NextResponse.json(session, { status: 201 });
}
