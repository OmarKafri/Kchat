import { getApiBaseUrl } from "@/lib/api-base";

type coverstaion = {
  id: string;
  createdAt: string;
  users: converstaion_user[];
};

type converstaion_user = {
  id: string;
  userId: string;
  converstaionId: string;
};

export async function addConverstaion(
  sender: string,
  reciver: string
): Promise<{ success: boolean; data?: coverstaion; error?: string }> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: sender,
        receiverId: reciver,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message || "cant create conversation" };
    }
    return { success: true, data: result.conversation };
  } catch (error) {
    console.log(error);
    return {success:false , error: "Internal error"}
  }
}
