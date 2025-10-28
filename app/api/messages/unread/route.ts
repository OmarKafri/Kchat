import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userID } = await req.json();
    if (!userID) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }
    const unreadMessages = await prisma.message.findMany({
      where: {
        isRead: false,
        senderId: { not: userID },
        conversation: { users: { some: { userId: userID } } },
      },
      select: {
        conversationId: true,
        senderId: true,
        conversation: {
          select: { users: { select: { userId: true } } },
        },
      },
    });

    const unreadContacts = unreadMessages.map((msg) => {
      const otherParticipant = msg.conversation.users.find(
        (p) => p.userId !== userID
      );
      return otherParticipant?.userId;
    });
    const unreadSenders = [...new Set(unreadContacts.filter(Boolean))]; // taking the unreadcontacts and removes falsy values (filter(boolean))  such as (undefined, null ,false, 0) , the set makes no duplicates values and convert it to object, thats why i used ... to convert it back to an array  

    return NextResponse.json(unreadSenders, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
