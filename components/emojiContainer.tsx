"use client";
import EmojiPicker,{Theme} from "emoji-picker-react";

export default function EmojiContainer({
  onEmojiSelect,
}: {
  onEmojiSelect: (emoji: string) => void;
}) {
  return (
    <div className="shadow-lg rounded-lg bg-gray-900 border border-gray-700 p-2">
      <EmojiPicker
        onEmojiClick={(emojiData) => onEmojiSelect(emojiData.emoji)}
        theme={Theme.DARK}
        width={350}
        height={400}
      />
    </div>
  );
}
