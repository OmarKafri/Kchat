import prisma from "@/lib/prisma";
import {  NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, conversationId } = await req.json();
    if(!userId || !conversationId)
       return NextResponse.json({ message: "Missing Fields" }, { status: 401 })

    await prisma.message.updateMany({
      where: { conversationId:conversationId, isRead: false, senderId: { not: userId } },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server error" },
      { status: 400 }
    );
  }
}
