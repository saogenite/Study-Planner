import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const topicId = String(body.topicId || "").trim();
  const focus = String(body.focus || "").trim();
  const qualityScore = body.qualityScore === "" ? null : Number(body.qualityScore ?? 0);
  const notes = body.notes ? String(body.notes) : null;

  if (!topicId || !focus) {
    return NextResponse.json(
      { message: "Tópico e foco são obrigatórios." },
      { status: 400 }
    );
  }

  const sessionId = params.id;

  const [session] = await prisma.$transaction([
    prisma.studySession.update({
      where: { id: sessionId },
      data: {
        topicId,
        focus,
        qualityScore,
        notes,
        status: "CATEGORIZED"
      }
    }),
    prisma.topic.update({
      where: { id: topicId },
      data: {
        lastTouchAt: new Date(),
        touchCount: { increment: 1 }
      }
    })
  ]);

  return NextResponse.json(session);
}
