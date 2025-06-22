"use client";

import { useState } from "react";
import { Send, Plus, Smile, Mic } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (disabled) {
    return (
      <div className="px-4 py-3 bg-gray-100 border-t border-gray-200">
        <div className="text-center text-gray-500 text-sm">
          This chat has been resolved and is now read-only
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* Add attachment button */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          title="Add attachment"
        >
          <Plus className="h-5 w-5" />
        </button>

        {/* Message input container */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message..."
            className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 pr-20 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={1}
            style={{
              minHeight: "44px",
              maxHeight: "120px",
              overflowY: message.split("\n").length > 2 ? "auto" : "hidden",
            }}
          />

          {/* Input actions */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button
              type="button"
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </button>

            {message.trim() ? (
              <button
                type="submit"
                className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Voice message"
              >
                <Mic className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
