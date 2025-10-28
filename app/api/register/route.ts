import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const saltRounds = 10;

  try {
    const body = await req.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUserEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUserEmail) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    const existingUserName = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUserName) {
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 400 }
      );
    }

    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", user: newUser },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
