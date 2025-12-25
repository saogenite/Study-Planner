import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const links = await prisma.examTopic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      exam: true,
      topic: {
        include: { discipline: true }
      }
    }
  });
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  const body = await request.json();
  const examId = String(body.examId || "").trim();
  const topicId = String(body.topicId || "").trim();

  if (!examId || !topicId) {
    return NextResponse.json(
      { message: "Edital e tópico são obrigatórios." },
      { status: 400 }
    );
  }

  const coverage = body.coverage ?? "INTEGRAL";
  const examImportance = Number(body.examImportance ?? 3);
  const notes = body.notes ? String(body.notes) : null;

  const link = await prisma.examTopic.create({
    data: {
      examId,
      topicId,
      coverage,
      examImportance,
      notes
    }
  });

  return NextResponse.json(link, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const id = String(body.id || "").trim();
  const examId = String(body.examId || "").trim();
  const topicId = String(body.topicId || "").trim();

  if (!id || !examId || !topicId) {
    return NextResponse.json(
      { message: "ID, edital e tópico são obrigatórios." },
      { status: 400 }
    );
  }

  const coverage = body.coverage ?? "INTEGRAL";
  const examImportance = Number(body.examImportance ?? 3);
  const notes = body.notes ? String(body.notes) : null;

  const link = await prisma.examTopic.update({
    where: { id },
    data: {
      examId,
      topicId,
      coverage,
      examImportance,
      notes
    }
  });

  return NextResponse.json(link);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "ID do vínculo é obrigatório." },
      { status: 400 }
    );
  }

  await prisma.examTopic.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
