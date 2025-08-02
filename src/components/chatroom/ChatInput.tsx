"use client";

import { useState, useRef } from "react";
import { Send, Plus, Smile, Mic } from "lucide-react";
import VoiceMessageBubble from "@/components/chatroom/VoiceMessageBubble"; // adjust the path

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
      <div className="px-3 py-2 bg-gray-100 border-t border-gray-200 text-center text-gray-500 text-sm safe-area-padding">
        This chat has been resolved and is now read-only
      </div>
    );
  }

  return (
    <div className="px-3 py-2 bg-white border-t border-gray-200 safe-area-padding">
      {selectedImagePreview && (
        <div className="mb-2 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <img
            src={selectedImagePreview}
            alt="Preview"
            className="h-10 w-auto rounded border border-gray-300 object-cover flex-shrink-0"
          />
          <div className="flex gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={sendSelectedImage}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
            <button
              type="button"
              onClick={cancelSelectedImage}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-full hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
          title="Add attachment"
        >
          <Plus className="w-5 h-5" />
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

        {/* Message Input OR Voice Bubble */}
        <div className="flex-1 relative min-w-0">
          {recordedAudioUrl ? (
            <div className="flex items-center justify-between w-full border border-gray-300 bg-white px-3 py-2 rounded-full">
              <VoiceMessageBubble src={recordedAudioUrl} className="flex-1 min-w-0" />
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={sendRecordedAudio}
                  className="w-8 h-8 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors touch-manipulation"
                  title="Send voice message"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={discardRecording}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors text-lg touch-manipulation"
                  title="Discard"
                >
                  ×
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                placeholder="Message..."
                className="w-full resize-none rounded-full border border-gray-300 bg-white px-4 py-2.5 pr-12 text-base placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ios-fix"
                rows={1}
                style={{
                  minHeight: "40px",
                  maxHeight: "120px",
                  fontSize: "16px", // Prevents zoom on iOS
                  WebkitAppearance: "none", // Remove iOS styling
                }}
              />

              {/* Input Actions (mic / send) */}
              <div className="absolute right-1 bottom-1 flex items-center">
                {message.trim() ? (
                  <button
                    type="submit"
                    className="w-8 h-8 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors touch-manipulation"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                ) : isRecording ? (
                  <div className="flex items-center gap-2 pr-1">
                    <span className="text-xs text-red-500 font-mono tabular-nums">
                      {formatTime(recordingTime)}
                    </span>
                    <button
                      type="button"
                      onMouseUp={stopRecording}
                      onMouseLeave={stopRecording}
                      onTouchEnd={stopRecording}
                      className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors touch-manipulation"
                      title="Release to stop recording"
                    >
                      <Mic className="w-4 h-4 animate-pulse" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                    title="Hold to record voice message"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </form>

      <style jsx>{`
        .safe-area-padding {
          padding-bottom: max(8px, env(safe-area-inset-bottom));
        }
        
        .ios-fix {
          -webkit-appearance: none;
          -webkit-border-radius: 0;
          border-radius: 9999px;
        }
        
        .touch-manipulation {
          touch-action: manipulation;
        }
        
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
        
        @media (max-width: 480px) {
          .ios-fix {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}