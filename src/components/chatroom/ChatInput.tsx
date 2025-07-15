"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, Smile, Mic } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string | { type: "audio" | "image"; url: string }) => void;
  onUploadFile: (file: File, folder: "images" | "audio") => Promise<string | null>;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onUploadFile, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    setRecordedAudioUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone", error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const sendRecordedAudio = async () => {
    if (!recordedAudioUrl) return;
    const response = await fetch(recordedAudioUrl);
    const blob = await response.blob();
    const file = new File([blob], "voice-message.webm", { type: "audio/webm" });
    const url = await onUploadFile(file, "audio");
    if (url) {
      onSendMessage({ type: "audio", url });
    }
    discardRecording();
  };

  const discardRecording = () => {
    setRecordedAudioUrl(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleFileUpload = async (file: File, type: "audio" | "image") => {
    const folder = type === "audio" ? "audio" : "images";
    const url = await onUploadFile(file, folder);
    if (url) {
      onSendMessage({ type, url });
    } else {
      console.error("Upload failed.");
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
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          title="Add attachment"
        >
          <Plus className="h-5 w-5" />
        </button>

        <input
          type="file"
          accept="image/*"
          hidden
          ref={imageInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, "image");
          }}
        />

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..."
            className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 pr-20 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={1}
            style={{
              minHeight: "44px",
              maxHeight: "120px",
              overflowY: message.split("\n").length > 2 ? "auto" : "hidden",
            }}
          />

          {/* Input Actions */}
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
            ) : recordedAudioUrl ? (
              <div className="flex items-center gap-1">
                <audio src={recordedAudioUrl} controls className="h-8" />
                <button
                  type="button"
                  onClick={sendRecordedAudio}
                  className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors"
                  title="Send voice message"
                >
                  <Send className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={discardRecording}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  title="Discard"
                >
                  ×
                </button>
              </div>
            ) : isRecording ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500 font-mono">{formatTime(recordingTime)}</span>
                <button
                  type="button"
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                  title="Release to stop recording"
                >
                  <Mic className="h-4 w-4 animate-pulse" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Hold to record voice message"
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
