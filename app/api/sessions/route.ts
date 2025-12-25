import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/default-user";

export async function GET(request: Request) {
  try {
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
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro interno ao carregar sessões." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const durationMin = Number(body.durationMin || 0);
    const timerSource =
      body.timerSource === "PRESET" || body.timerSource === "MANUAL"
        ? body.timerSource
        : null;
    const startedAt = body.startedAt ? new Date(body.startedAt) : null;
    const endedAt = body.endedAt ? new Date(body.endedAt) : null;

    if (!startedAt || Number.isNaN(startedAt.getTime())) {
      return NextResponse.json(
        { message: "Data de início inválida." },
        { status: 400 }
      );
    }

    if (!endedAt || Number.isNaN(endedAt.getTime())) {
      return NextResponse.json(
        { message: "Data de término inválida." },
        { status: 400 }
      );
    }

    if (!durationMin || durationMin < 1 || durationMin > 240) {
      return NextResponse.json(
        { message: "Duração inválida para a sessão." },
        { status: 400 }
      );
    }

    if (!timerSource) {
      return NextResponse.json(
        { message: "Fonte do timer inválida." },
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
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro interno ao registrar sessão." },
      { status: 500 }
    );
  }
}
