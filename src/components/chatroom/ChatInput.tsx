"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, Smile, Mic } from "lucide-react";
import VoiceMessageBubble from "@/components/chatroom/VoiceMessageBubble"; // adjust the path

interface ChatInputProps {
  onSendMessage: (content: string | { type: "audio" | "image"; url: string }) => void;
  onUploadFile: (file: File, folder: "images" | "audio") => Promise<string | null>;
  disabled?: boolean;
  chatroomId: string;
}

export function ChatInput({ onSendMessage, onUploadFile, disabled, chatroomId }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clean up resources when component unmounts
      releaseAudioResources();
      
      // Clean up any remaining blob URLs
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    };
  }, [recordedAudioUrl, selectedImagePreview]);

  // Image Handling
  const handleImageSelection = (file: File) => {
    setSelectedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setSelectedImagePreview(previewUrl);
  };

  const sendSelectedImage = async () => {
    if (!selectedImageFile || isUploadingImage) return;
    
    setIsUploadingImage(true);
    try {
      await handleFileUpload(selectedImageFile, "image");
      URL.revokeObjectURL(selectedImagePreview!);
      setSelectedImageFile(null);
      setSelectedImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
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
      mediaStreamRef.current = stream;
  
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

  const releaseAudioResources = () => {
    // Stop all tracks in the MediaStream to release microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Clear MediaRecorder reference
    mediaRecorderRef.current = null;
    
    // Clear timer if running
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const sendRecordedAudio = async () => {
    if (!recordedAudioUrl || isUploadingAudio) return;
    
    setIsUploadingAudio(true);
    try {
      const response = await fetch(recordedAudioUrl);
      const blob = await response.blob();
      const file = new File([blob], "voice-message.webm", { type: "audio/webm" });
      const url = await onUploadFile(file, "audio");
      if (url) {
        onSendMessage({ type: "audio", url });
      }
      discardRecording();
    } finally {
      setIsUploadingAudio(false);
      // Release audio resources after sending
      releaseAudioResources();
    }
  };

  const discardRecording = () => {
    // Clean up the blob URL to prevent memory leaks
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    
    setRecordedAudioUrl(null);
    setRecordingTime(0);
    
    // Release audio resources when discarding
    releaseAudioResources();
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
    <div className="px-2 sm:px-3 py-2 bg-white border-t border-gray-200 safe-area-padding">
      {selectedImagePreview && (
        <div className="mb-2 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <img
            src={selectedImagePreview}
            alt="Preview"
            className="h-8 sm:h-10 w-auto rounded border border-gray-300 object-cover flex-shrink-0"
          />
          <div className="flex gap-1 flex-shrink-0 ml-auto">
            <button
              type="button"
              onClick={sendSelectedImage}
              disabled={isUploadingImage}
              className={`px-2 sm:px-3 py-1 text-xs rounded-full transition-colors touch-manipulation min-w-[44px] h-[32px] flex items-center justify-center ${
                isUploadingImage 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isUploadingImage ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </button>
            <button
              type="button"
              onClick={cancelSelectedImage}
              disabled={isUploadingImage}
              className={`px-2 sm:px-3 py-1 text-xs rounded-full transition-colors touch-manipulation min-w-[44px] h-[32px] flex items-center justify-center ${
                isUploadingImage
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-1 sm:gap-2">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px]"
          title="Add attachment"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
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
            <div className="flex items-center justify-between w-full border border-gray-300 bg-white px-2 sm:px-3 py-2 rounded-full min-h-[44px]">
              <VoiceMessageBubble src={recordedAudioUrl} className="flex-1 min-w-0 mr-2" />
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={sendRecordedAudio}
                  disabled={isUploadingAudio}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] ${
                    isUploadingAudio
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-500 hover:text-blue-700 hover:bg-blue-100'
                  }`}
                  title={isUploadingAudio ? "Uploading..." : "Send voice message"}
                >
                  {isUploadingAudio ? (
                    <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={discardRecording}
                  disabled={isUploadingAudio}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors text-lg touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] ${
                    isUploadingAudio
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                  }`}
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
                className="w-full resize-none rounded-full border border-gray-300 bg-white px-3 sm:px-4 py-2.5 pr-12 sm:pr-14 text-base placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ios-fix"
                rows={1}
                style={{
                  minHeight: "44px",
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
                    className="w-8 h-8 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px]"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                ) : isRecording ? (
                  <div className="flex items-center gap-1 sm:gap-2 pr-1">
                    <span className="text-xs text-red-500 font-mono tabular-nums whitespace-nowrap">
                      {formatTime(recordingTime)}
                    </span>
                    <button
                      type="button"
                      onMouseUp={stopRecording}
                      onMouseLeave={stopRecording}
                      onTouchEnd={stopRecording}
                      className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px]"
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
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px]"
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
          -webkit-tap-highlight-color: transparent;
        }
        
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
        
        /* Mobile-first responsive design */
        @media (max-width: 640px) {
          .ios-fix {
            font-size: 16px !important;
            padding-left: 12px !important;
            padding-right: 48px !important;
          }
          
          /* Ensure buttons are touch-friendly on mobile */
          button {
            min-width: 44px;
            min-height: 44px;
          }
          
          /* Adjust spacing for smaller screens */
          .gap-2 {
            gap: 4px;
          }
        }
        
        @media (min-width: 641px) {
          /* Desktop styles */
          button {
            min-width: 32px;
            min-height: 32px;
          }
        }
        
        /* Prevent text selection on buttons */
        button {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Improve focus visibility for accessibility */
        button:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
