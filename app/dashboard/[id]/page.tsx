"use client";
import { useParams, useSearchParams } from "next/navigation";
import { MessageContainer } from "@/components/messageContainer";
import { UserInfromation } from "@/components/userInformation";
import { useSession } from "next-auth/react";

export default function ConverstaionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const convo_id = params.id as string;
  const { data } = useSession();
  const user_id = searchParams.get("receiverId") as string;
  const senderId = data?.user?.id as string;

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <UserInfromation reciver_id={user_id} />
      <MessageContainer   reciver_id={user_id}  user_id={senderId} conversation_id={convo_id} />
    </div>
  );
}
