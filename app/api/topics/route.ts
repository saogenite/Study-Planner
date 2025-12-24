import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/default-user";

export async function GET() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      discipline: true,
      parent: true
    }
  });
  return NextResponse.json(topics);
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = String(body.title || "").trim();
  const disciplineId = String(body.disciplineId || "").trim();
  const parentId = body.parentId ? String(body.parentId) : null;

  if (!title || !disciplineId) {
    return NextResponse.json(
      { message: "Título e disciplina são obrigatórios." },
      { status: 400 }
    );
  }

  const userId = await getDefaultUserId();
  const difficulty = Number(body.difficulty ?? 3);
  const personalPriority = Number(body.personalPriority ?? 3);

  const topic = await prisma.topic.create({
    data: {
      userId,
      disciplineId,
      parentId: parentId || null,
      title,
      difficulty,
      personalPriority
    }
  });

  return NextResponse.json(topic, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const id = String(body.id || "").trim();
  const title = String(body.title || "").trim();
  const disciplineId = String(body.disciplineId || "").trim();
  const parentId = body.parentId ? String(body.parentId) : null;

  if (!id || !title || !disciplineId) {
    return NextResponse.json(
      { message: "ID, título e disciplina são obrigatórios." },
      { status: 400 }
    );
  }

  const difficulty = Number(body.difficulty ?? 3);
  const personalPriority = Number(body.personalPriority ?? 3);

  const topic = await prisma.topic.update({
    where: { id },
    data: {
      title,
      disciplineId,
      parentId: parentId || null,
      difficulty,
      personalPriority
    }
  });

  return NextResponse.json(topic);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "ID do tópico é obrigatório." },
      { status: 400 }
    );
  }

  await prisma.topic.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
