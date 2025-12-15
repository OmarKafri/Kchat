"use client";

import { MessageInput } from "./messageInput";
import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "@/lib/socket";
import { messages } from "@/types/user";
import { getMessagesForConversation } from "@/lib/actions/messages";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { getFormatedTimeDateJordan } from "@/lib/utils";
import { Phone, Bot } from "lucide-react";

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
  const [messagesList, setMessagesList] = useState<messages[]>();
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isLoading, messagesList]);

  const getMessages = useCallback(async () => {
    try {
      const result = await getMessagesForConversation(conversation_id);
      if (!result.success) {
        toast.error(result.error);
      } else {
        setMessagesList(result.data);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong, try again later";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [conversation_id]);

  useEffect(() => {
    if (!user_id || !conversation_id) return;
    
    socket.emit("join_conversation", conversation_id);
    
    getMessages();
   
    socket.emit("message_read",{reciver_id,conversation_id});
    socket.on("receive_message", (newMessage) => {
      if (newMessage.conversationId === conversation_id) {
        setMessagesList((prev) => [...(prev ?? []), newMessage]);
      }
    });

    socket.on("receive_bot_message", (botMessage) => {
      if (botMessage.conversationId === conversation_id) {
        setMessagesList((prev) => [...(prev ?? []), botMessage]);
      }
    });

    return () => {
      socket.emit("leave_conversation", conversation_id);
      socket.off("receive_message");
      socket.off("receive_bot_message");
    };
  }, [conversation_id,user_id,reciver_id,getMessages]);

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
              const isBotMessage = msg.content.startsWith("🤖 ");
              const { time, date } = getFormatedTimeDateJordan(msg.createdAt);
              const isMissedCall = msg.content.startsWith("Missed Call From");
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const messageKey = (msg as any).id || i;

              const showDateSeparator = lastDate !== date;
              lastDate = date;

            
              if (isMissedCall && isSender) {
                return null;
              }

            
              if (isBotMessage) {
               
                const botContent = msg.content.replace(/^🤖 /, "");
                return (
                  <div key={messageKey}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-2">
                        <span className="bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-xs">
                          {date}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-center my-3">
                      <div className="max-w-2xl w-full bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-xl px-4 py-3 shadow-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-purple-300">
                                KChat Bot
                              </span>
                              <span className="text-xs text-purple-400/70">
                                {time}
                              </span>
                            </div>
                            <p className="text-sm text-gray-100 break-words whitespace-pre-wrap leading-relaxed">
                              {botContent}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              if (isMissedCall) {
                return (
                  <div key={messageKey}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-2">
                        <span className="bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-xs">
                          {date}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-center my-2">
                      <div className="bg-red-900/30 border border-red-600/50 px-4 py-2 rounded-lg text-sm text-red-300 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{msg.content}</span>
                        <span className="text-xs text-red-400/70 ml-2">
                          {time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={messageKey}>
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
                      className={`max-w-xs  px-4 py-2 rounded-2xl text-sm ${
                        isSender
                          ? "bg-green-800 text-white rounded-br-none"
                          : "bg-gray-700 text-gray-100 rounded-bl-none"
                      }`}
                    >
                      <p className="break-words whitespace-pre-wrap">{msg.content}</p>
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
