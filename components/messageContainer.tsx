"use client";

import { useChatStore } from "@/store/chatStore";
import { MessageInput } from "./messageInput";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { messages } from "@/types/user";
import { getMessagesForConversation } from "@/lib/actions/messages";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { getFormatedTimeDateJordan } from "@/lib/utils";
import { readMessage } from "@/lib/actions/messages";

export type MessageContainerPropsAndInput = {
  user_id: string;
  conversation_id: string;
  reciver_id:string
};

export function MessageContainer({
  user_id,
  conversation_id,
  reciver_id
}: MessageContainerPropsAndInput) {
  const { message, setMessage } = useChatStore();
  const [messagesList, setMessagesList] = useState<messages[]>();
  const [error, setError] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isLoading, messagesList]);

  const markMessages = async () => {
    try {
      const result = await readMessage(user_id, conversation_id);
      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
      }
    
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong, try again later";
      setError(message);
      toast.error(message);
    }
  };

  const getMessages = async () => {
    try {
      const result = await getMessagesForConversation(conversation_id);
      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
      } else {
        setMessagesList(result.data);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong, try again later";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user_id || !conversation_id) return;
    
    socket.emit("join_conversation", conversation_id);
    
    getMessages();
    // markMessages();
    socket.emit("message_read",{reciver_id,conversation_id});
    socket.on("receive_message", (newMessage) => {
      if (newMessage.conversationId === conversation_id) {
        setMessagesList((prev) => [...(prev ?? []), newMessage]);
      }
    });

    return () => {
      socket.emit("leave_conversation", conversation_id);
      socket.off("receive_message");
    };
  }, [conversation_id,user_id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="size-10 text-gray-100" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-white"
      >
        {messagesList?.length === 0 ? (
          <h1 className="text-center text-gray-400">
            No messages in this conversation yet
          </h1>
        ) : (
          (() => {
            let lastDate: string | null = null;
            return messagesList?.map((msg, i) => {
              const isSender = msg.senderId === user_id;
              const { time, date } = getFormatedTimeDateJordan(msg.createdAt);

              const showDateSeparator = lastDate !== date;
              lastDate = date;

              return (
                <div key={i}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-2">
                      <span className="bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-xs">
                        {date}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex ${
                      isSender ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                        isSender
                          ? "bg-green-800 text-white rounded-br-none"
                          : "bg-gray-700 text-gray-100 rounded-bl-none"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span className="text-xs text-gray-400 self-end">
                        {time}
                      </span>
                    </div>
                  </div>
                </div>
              );
            });
          })()
        )}
      </div>

      <div className="border-t border-gray-700 bg-gray-900 sticky bottom-0">
        <MessageInput user_id={user_id} conversation_id={conversation_id} />
      </div>
    </div>
  );
}
