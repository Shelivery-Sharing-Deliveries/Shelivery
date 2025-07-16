"use client";

import { useState, useRef } from "react";
import { Send, Plus, Smile, Mic } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string | { type: "audio" | "image"; url: string }) => void;
  onUploadFile: (file: File, folder: "images" | "audio") => Promise<string | null>;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onUploadFile, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Image Handling
  const handleImageSelection = (file: File) => {
    setSelectedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setSelectedImagePreview(previewUrl);
  };

  const sendSelectedImage = async () => {
    if (!selectedImageFile) return;
    await handleFileUpload(selectedImageFile, "image");
    URL.revokeObjectURL(selectedImagePreview!);
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
  };

  const cancelSelectedImage = () => {
    if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview);
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
  };

  // Audio Recording
  const startRecording = async () => {
    setRecordedAudioUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }
  
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
  
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
  
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
  
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
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
      console.error('Error accessing microphone', error);
      alert('Microphone access failed. Ensure your browser has permission and supports audio recording.');
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

  const handleSubmit = (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
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
      <div className="px-4 py-3 bg-gray-100 border-t border-gray-200 text-center text-gray-500 text-sm">
        This chat has been resolved and is now read-only
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-200">
      {selectedImagePreview && (
  <div className="mb-2 flex items-center gap-2">
    <img
      src={selectedImagePreview}
      alt="Preview"
      className="h-16 w-auto rounded-md border border-gray-300 object-cover"
    />
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={sendSelectedImage}
        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
      >
        Send Image
      </button>
      <button
        type="button"
        onClick={cancelSelectedImage}
        className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition"
      >
        Cancel
      </button>
    </div>
  </div>
)}

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          title="Add attachment"
        >
          <Plus className="h-full w-full" />
        </button>

        <input
          type="file"
          accept="image/*"
          hidden
          ref={imageInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageSelection(file);
          }}
        />

        {/* Message Input */}
        <div className="flex-1 relative">
        <textarea
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any); // cast to any to satisfy TS for now
    }
  }}
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
            

            {message.trim() ? (
              <button
                type="submit"
                className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors"
                title="Send message"
              >
                <Send className="h-full w-full" />
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
                  <Send className="h-full w-full" />
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
                  <Mic className="h-full w-full animate-pulse" />
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
                <Mic className="h-full w-full" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
