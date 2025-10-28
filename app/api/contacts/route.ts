import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const contacts = await prisma.user.findMany();
    return NextResponse.json({ Users: contacts }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 404 }
      );
    }
    const contacts = await prisma.user.findMany({
      where: { id: { not: userId } },
    });
    return NextResponse.json({ Users: contacts }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
