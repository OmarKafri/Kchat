export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

type UpdatedInfo = {
  username?: string;
  image?: string;
  passwordHash?: string;
};

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const userID = searchParams.get("userID") as string;

    const body = await req.json();
    const { currentPassword } = body;

    if (!userID) {
      return NextResponse.json({ message: "Missing userID" }, { status: 400 });
    }
    if (!currentPassword) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userID },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const matched = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!matched) {
      return NextResponse.json(
        { message: "Incorrect password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Password verification error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userID = searchParams.get("userID") as string;

    if (!userID) {
      return NextResponse.json({ message: "Missing userID" }, { status: 400 });
    }

    const updated = (await req.json()) as UpdatedInfo;

    if (updated.passwordHash) {
      updated.passwordHash = await bcrypt.hash(updated.passwordHash, 10);
    }

    const dataToUpdate: Record<string, unknown> = {};
    if (typeof updated.username === "string")
      dataToUpdate.username = updated.username;
    if (typeof updated.image === "string") dataToUpdate.image = updated.image;
    if (typeof updated.passwordHash === "string")
      dataToUpdate.passwordHash = updated.passwordHash;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { message: "No data to update" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userID },
      data: dataToUpdate,
    });

    const safeUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      image: updatedUser.image,
    };

    return NextResponse.json({
      message: "User updated successfully",
      data: safeUser,
    });
  } catch (err) {
    console.error("User update error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
