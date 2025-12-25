import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/default-user";

export async function GET() {
  const exams = await prisma.exam.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(exams);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();

  if (!name) {
    return NextResponse.json(
      { message: "Nome do edital é obrigatório." },
      { status: 400 }
    );
  }

  const userId = await getDefaultUserId();
  const status = body.status ?? "ACTIVE";
  const priorityWeight = Number(body.priorityWeight ?? 60);
  const examDate = body.examDate ? new Date(body.examDate) : null;

  const exam = await prisma.exam.create({
    data: {
      userId,
      name,
      status,
      priorityWeight,
      examDate
    }
  });

  return NextResponse.json(exam, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const id = String(body.id || "").trim();
  const name = String(body.name || "").trim();

  if (!id || !name) {
    return NextResponse.json(
      { message: "ID e nome do edital são obrigatórios." },
      { status: 400 }
    );
  }

  const status = body.status ?? "ACTIVE";
  const priorityWeight = Number(body.priorityWeight ?? 60);
  const examDate = body.examDate ? new Date(body.examDate) : null;

  const exam = await prisma.exam.update({
    where: { id },
    data: {
      name,
      status,
      priorityWeight,
      examDate
    }
  });

  return NextResponse.json(exam);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "ID do edital é obrigatório." },
      { status: 400 }
    );
  }

  await prisma.exam.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
