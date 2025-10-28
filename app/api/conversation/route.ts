import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { senderId, receiverId } = await req.json();

    if (!senderId || !receiverId)
      return NextResponse.json({ message: "Missing IDs" }, { status: 400 });

    const existing = await prisma.conversation.findFirst({
      where: {
        users: {
          every: {
            userId: { in: [senderId, receiverId] },
          },
        },
      },
      include: { users: true },
    });

    if (existing)
      return NextResponse.json({ conversation: existing }, { status: 200 });

    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          create: [
            { user: { connect: { id: senderId } } },
            { user: { connect: { id: receiverId } } },
          ],
        },
      },
      include: { users: true },
    });

    return NextResponse.json(
      { conversation: newConversation },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({message:"An error Acord"},{status:404})
  }
}
