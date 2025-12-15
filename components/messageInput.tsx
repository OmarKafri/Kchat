"use client";
import { useState, useRef, useEffect } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import EmojiContainer from "./emojiContainer";
import { Input } from "./ui/input";
import { Smile, Mic, ScanFace, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useChatStore } from "@/store/chatStore";
import { socket } from "@/lib/socket";
import { MessageContainerPropsAndInput } from "./messageContainer";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bot } from "lucide-react";

const rightIcons = [
  { name: "Mic", icon: <Mic size={20} /> },
  { name: "Image", icon: <ImageIcon size={20} /> },
  { name: "Gifs Or Stickers", icon: <ScanFace size={20} /> },
];

export function MessageInput({
  user_id,
  conversation_id,
}: Omit<MessageContainerPropsAndInput, "reciver_id">) {
  const [emojiClicked, setEmojiClicked] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const { setMessage } = useChatStore();
  const messageRef = useRef(messageInput);
  const inputRef = useRef<HTMLInputElement>(null);

  const [showBotPicker, setShowBotPicker] = useState(false);

  useEffect(() => {
    messageRef.current = messageInput;
  }, [messageInput]);

  const handleEmojiClick = (emoji: string) => {
    const currentMessage = messageRef.current;
    const cursorPosition =
      inputRef.current?.selectionStart || currentMessage.length;

    const newMessage =
      currentMessage.slice(0, cursorPosition) +
      emoji +
      currentMessage.slice(cursorPosition);

    setMessageInput(newMessage);
    inputRef.current?.focus();
  };

  function later() {
    toast.info("Will Be Added Later");
  }
  function handleSend() {
    setMessage(messageInput);

    socket.emit("send_message", {
      content_text: messageInput,
      userId: user_id,
      conversation_id: conversation_id,
    });

    setMessageInput("");
  }
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      messageInput.trim().length != 0
    ) {
      event.preventDefault();
      handleSend();
    }
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    // Show bot picker when user types @
    if (
      value.trim() === "@" ||
      (value.trim().startsWith("@") && !value.trim().startsWith("@kchat"))
    ) {
      setShowBotPicker(true);
    } else {
      setShowBotPicker(false);
    }
  };
  function handleBotSelect() {
    setMessageInput("@kchat ");
    setShowBotPicker(false);
    inputRef.current?.focus();
  }

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-2 w-full px-4 py-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setEmojiClicked((prev) => !prev)}
            className="text-gray-400 hover:text-gray-200 transition"
          >
            <Smile size={22} />
          </button>

          {emojiClicked && (
            <div className="absolute bottom-16 left-0 z-50">
              <EmojiContainer onEmojiSelect={handleEmojiClick} />
            </div>
          )}
        </div>

        <div className="flex items-center bg-gray-800 rounded-full flex-1 px-4">
          <Input
            onKeyDown={handleKeyDown}
            ref={inputRef}
            value={messageInput}
            onChange={handleChange}
            className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-100 placeholder-gray-400 placeholder:text-base w-full outline-none"
            placeholder="Message..."
          />
        </div>

        {messageInput.trim().length === 0 ? (
          <div className="flex items-center gap-2">
            {rightIcons.map((btn, i) => (
              <button
                onClick={later}
                key={i}
                className="text-gray-400 hover:text-gray-200 transition"
                title={btn.name}
                type="button"
              >
                {btn.icon}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={handleSend}
            className="text-green-600 hover:text-green-400 hover:underline"
          >
            Send
          </button>
        )}
      </div>
      {showBotPicker && (
        <div className="absolute bottom-20 left-4 z-50 w-[95%] max-w-sm animate-in fade-in slide-in-from-bottom-2">
          <DropdownMenu open>
            <DropdownMenuTrigger asChild>
              <div />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              side="top"
              className="w-full bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl p-2"
            >
              <DropdownMenuItem
                onClick={handleBotSelect}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg hover:bg-gray-800/80 focus:bg-gray-800/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                  <Bot size={20} />
                </div>

                <div className="flex flex-col flex-1">
                  <span className="text-sm font-semibold text-white">
                    KChat Bot
                  </span>
                  <span className="text-xs text-gray-400">
                    AI assistant - Ask anything
                  </span>
                </div>
                <div className="px-2 py-1 bg-green-500/20 rounded-md">
                  <span className="text-xs text-green-400 font-medium">AI</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  );
}
