import { messages } from "@/types/user";

export async function getMessagesForConversation(convo_id: string): Promise<{
  success: boolean;
  error?: string;
  data?: messages[];
}> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/messages?conversationId=${convo_id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message };

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Internal error" };
  }
}

export async function createMessage(
  text_content: string,
  senderId: string,
  convoId: string
): Promise<{ success: boolean; error?: string; data?: messages }> {
  try {
    const response = await fetch("http://localhost:3000/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: senderId,
        conversationId: convoId,
        text: text_content,
      }),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message };

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Internal error" };
  }
}

export async function unreadMessages(
  user_id: string
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    const response = await fetch("http://localhost:3000/api/messages/unread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userID: user_id,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message || "Something Went Wrong!" };
    }
    return { success: true, data: result };
  } catch (error) {
    return {success:false , error: "Internal error"}
  }
}

export async function readMessage(
  user_id: string,
  conversation_Idd :string
): Promise<{ success: boolean ; error?: string }> {
  try {
    const response = await fetch("http://localhost:3000/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user_id,
        conversationId:conversation_Idd
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message || "Something Went Wrong!" };
    }
    return { success: true };
  } catch (error) {
    return {success:false , error: "Internal error"}
  }
}


