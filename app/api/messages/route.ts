import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const convo_id = searchParams.get("conversationId");
    if (!convo_id)
      return NextResponse.json(
        { message: "Missing conversation ID" },
        { status: 400 }
      );
    const messages = await prisma.message.findMany({
      where: { conversationId: convo_id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 404 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { senderId, conversationId, text } = await req.json();
    if (!senderId || !conversationId || !text) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const newMessage = await prisma.message.create({
      data: {
        content: text,
        conversationId: conversationId,
        senderId: senderId,
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error sending message" },
      { status: 500 }
    );
  }
}
