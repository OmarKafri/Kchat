"use client";
import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import EmojiContainer from "./emojiContainer";
import { Input } from "./ui/input";
import { Smile, Mic, ScanFace, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useChatStore } from "@/store/chatStore";
import { socket } from "@/lib/socket";
import { MessageContainerPropsAndInput } from "./messageContainer";

const rightIcons = [
  { name: "Mic", icon: <Mic size={20} /> },
  { name: "Image", icon: <ImageIcon size={20} /> },
  { name: "Gifs Or Stickers", icon: <ScanFace size={20} /> },
];



export function MessageInput({user_id,conversation_id}:Omit<MessageContainerPropsAndInput,"reciver_id">) {
  const [emojiClicked, setEmojiClicked] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const { setMessage } = useChatStore();
  const messageRef = useRef(messageInput);
  const inputRef = useRef<HTMLInputElement>(null);

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

    socket.emit("send_message",{
      content_text:messageInput,
      userId:user_id,
      conversation_id:conversation_id
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

  return (
    <div className="relative flex items-center gap-2 w-full px-4 py-3 sticky top-0">
      <button
        type="button"
        onClick={() => setEmojiClicked((prev) => !prev)}
        className="text-gray-400 hover:text-gray-200 transition relative"
      >
        <Smile size={22} />
      </button>

      {emojiClicked && (
        <div className="absolute bottom-16 left-0 z-50">
          <EmojiContainer onEmojiSelect={handleEmojiClick} />
        </div>
      )}

      <div className="flex items-center bg-gray-800 rounded-full flex-1 px-4">
        <Input
          onKeyDown={handleKeyDown}
          ref={inputRef}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
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
  );
}
