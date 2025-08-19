"use client";

import { useEffect, useRef } from "react";
import { Tables } from "@/lib/supabase";
import { Avatar } from "@/components/ui/Avatar";
import VoiceMessageBubble from "@/components/chatroom/VoiceMessageBubble"; // adjust the path

interface ChatMessagesProps {
  messages: Array<
    Tables<"message"> & {
      user: Tables<"user">;
    }
  >;
  currentUserId: string;
}

export function ChatMessages({ messages, currentUserId }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, []);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  };

  const formatDate = (date: Date, pattern: string) => {
    if (pattern === "h:mm a") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (pattern === "MMM d, h:mm a") {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (pattern === "EEEE, MMMM d") {
      return date.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
    return date.toLocaleString();
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return formatDate(date, "h:mm a");
    } else if (isYesterday(date)) {
      return `Yesterday ${formatDate(date, "h:mm a")}`;
    } else {
      return formatDate(date, "MMM d, h:mm a");
    }
  };

  const groupMessagesByDay = () => {
    const grouped: { [key: string]: typeof messages } = {};
    if (!messages || messages.length === 0) return grouped;

    messages.forEach((message) => {
      const date = new Date(message.sent_at || new Date());
      let dayKey: string;

      if (isToday(date)) {
        dayKey = "Today";
      } else if (isYesterday(date)) {
        dayKey = "Yesterday";
      } else {
        dayKey = formatDate(date, "EEEE, MMMM d");
      }

      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey]!.push(message);
    });

    return grouped;
  };

  const groupedMessages = groupMessagesByDay();

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            💬
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Welcome to the chatroom!
          </h3>
          <p className="text-gray-600 max-w-sm">
            Start the conversation by sending a message to your group members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        {Object.entries(groupedMessages).map(([day, dayMessages]) => (
          <div key={day}>
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                {day}
              </div>
            </div>

            <div className="space-y-4">
              {dayMessages?.map((message, index) => {
                const isOwnMessage = message.user_id === currentUserId;
                const prevMessage = index > 0 ? dayMessages[index - 1] : null;
                const showAvatar =
                  !prevMessage || prevMessage.user_id !== message.user_id;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      isOwnMessage ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 ${
                        showAvatar ? "" : "invisible"
                      }`}
                    >
                      <Avatar
                        src={message.user?.image}
                        name={message.user?.email?.split('@')[0] || "Unknown"}
                        size="sm"
                      />
                    </div>

                    <div
                      className={`flex flex-col ${
                        isOwnMessage ? "items-end" : "items-start"
                      } max-w-md`}
                    >
                      {showAvatar && (
                        <div
                          className={`flex items-center gap-2 mb-1 ${
                            isOwnMessage ? "justify-end" : ""
                          }`}
                        >
                          <span className="font-medium text-gray-900 text-sm">
                            {message.user?.first_name || 
                              message.user?.email?.split("@")[0] ||
                              "Unknown"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(message.sent_at || new Date().toISOString())}
                          </span>
                        </div>
                      )}

                      <div
                        className={`rounded-2xl p-3 inline-block max-w-xs
                          ${
                            isOwnMessage
                              ? "bg-[#245b7b] text-white rounded-br-lg"
                              : "bg-white text-gray-900 rounded-bl-lg border border-gray-200"
                          }
                          ${message.type === "image" || message.type === "audio" ? "w-full" : ""}
                        `}
                      >
                        {message.type === "image" && message.content ? (
                          <img
                            src={message.content}
                            alt="Sent image"
                            className="rounded-xl w-full h-auto"
                          />
                        ) : message.type === "audio" && message.content ? (
                          <div className="p-1">
                            <VoiceMessageBubble
                              src={message.content}
                              className="w-full"
                            />
                          </div>
                        ) : (
                          <span className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </span>
                        )}
                      </div>

                      {!showAvatar && (
                        <div
                          className={`text-xs text-gray-500 mt-1 ${
                            isOwnMessage ? "text-right" : ""
                          }`}
                        >
                          {formatMessageTime(message.sent_at || new Date().toISOString())}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
