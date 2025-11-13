import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();
    if (!user_id)
      return NextResponse.json({ message: "Missing fields!" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user)
      return NextResponse.json(
        { message: "No Contact With This ID!" },
        { status: 400 }
      );

    return NextResponse.json({ contact: user }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

