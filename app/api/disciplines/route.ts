import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultUserId } from "@/lib/default-user";

export async function GET() {
  const disciplines = await prisma.discipline.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(disciplines);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();

  if (!name) {
    return NextResponse.json(
      { message: "Nome da disciplina é obrigatório." },
      { status: 400 }
    );
  }

  const userId = await getDefaultUserId();
  const basePriority = Number(body.basePriority ?? 3);

  const discipline = await prisma.discipline.create({
    data: {
      userId,
      name,
      basePriority
    }
  });

  return NextResponse.json(discipline, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const id = String(body.id || "").trim();
  const name = String(body.name || "").trim();

  if (!id || !name) {
    return NextResponse.json(
      { message: "ID e nome da disciplina são obrigatórios." },
      { status: 400 }
    );
  }

  const basePriority = Number(body.basePriority ?? 3);

  const discipline = await prisma.discipline.update({
    where: { id },
    data: {
      name,
      basePriority
    }
  });

  return NextResponse.json(discipline);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "ID da disciplina é obrigatório." },
      { status: 400 }
    );
  }

  await prisma.discipline.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
