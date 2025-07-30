"use client";

import { useState, useRef, useEffect } from "react"; // Import useEffect
import { Send, Plus, Smile, Mic } from "lucide-react";
import VoiceMessageBubble from "@/components/chatroom/VoiceMessageBubble"; // adjust the path - UNCOMMENTED

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
  const streamRef = useRef<MediaStream | null>(null); // New ref for the MediaStream

  // Cleanup function to stop recording and release microphone
  const cleanupRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null; // Clear the stream ref
    }
  };

  // Effect for cleaning up resources when the component unmounts
  useEffect(() => {
    return () => {
      cleanupRecording(); // Ensure microphone is released on unmount
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview); // Clean up image preview URL
      }
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl); // Clean up audio URL
      }
    };
  }, [selectedImagePreview, recordedAudioUrl]); // Add dependencies for cleanup

  // Image Handling
  const handleImageSelection = (file: File) => {
    setSelectedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setSelectedImagePreview(previewUrl);
  };

  const sendSelectedImage = async () => {
    if (!selectedImageFile) return;
    await handleFileUpload(selectedImageFile, "image");
    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }
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
      streamRef.current = stream; // Store the stream in the ref

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
        // Stream tracks are stopped in cleanupRecording, which is called by stopRecording
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone', error);
      // Using a simple div for message instead of alert
      const messageBox = document.createElement('div');
      messageBox.textContent = 'Microphone access failed. Ensure your browser has permission and supports audio recording.';
      messageBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;
        padding: 15px; border-radius: 5px; z-index: 1000; text-align: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      `;
      document.body.appendChild(messageBox);
      setTimeout(() => document.body.removeChild(messageBox), 3000); // Remove after 3 seconds
    }
  };

  const stopRecording = () => {
    cleanupRecording(); // Call the unified cleanup function
  };

  const sendRecordedAudio = async () => {
    if (!recordedAudioUrl) return;
    const response = await fetch(recordedAudioUrl);
    const blob = await response.blob();
    // Determine file extension based on mimeType
    let fileExtension = 'webm';
    if (mediaRecorderRef.current?.mimeType.includes('mp4')) {
      fileExtension = 'mp4';
    } else if (mediaRecorderRef.current?.mimeType.includes('ogg')) {
      fileExtension = 'ogg';
    }
    const file = new File([blob], `voice-message.${fileExtension}`, { type: mediaRecorderRef.current?.mimeType || "audio/webm" });
    const url = await onUploadFile(file, "audio");
    if (url) {
      onSendMessage({ type: "audio", url });
    } else {
      console.error("Audio upload failed.");
    }
    discardRecording();
  };

  const discardRecording = () => {
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
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
      <div className="px-3 py-4 bg-gray-100 border-t border-gray-200 text-center text-gray-500 text-sm safe-area-padding-disabled">
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

      {/* Conditional rendering for VoiceMessageBubble outside the form if needed, or ensure it's handled properly */}
      {recordedAudioUrl && !isRecording && ( // Only show if recorded and not actively recording
        <div className="mb-2 flex items-center justify-between w-full border border-gray-300 bg-white px-3 py-2 rounded-full">
          {/* Now using VoiceMessageBubble component */}
          <VoiceMessageBubble src={recordedAudioUrl} className="flex-1 min-w-0" />
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <button
              type="button"
              onClick={sendRecordedAudio}
              className="w-10 h-10 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors touch-manipulation"
              title="Send voice message"
            >
              <Send className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={discardRecording}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors text-lg touch-manipulation"
              title="Discard"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
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

        {/* Message Input OR Voice Recording Indicator */}
        <div className="flex-1 relative min-w-0">
          {isRecording ? (
            <div className="flex items-center justify-between w-full border border-red-300 bg-red-50 px-4 py-2.5 rounded-full min-h-[40px]">
              <span className="text-sm text-red-600 font-medium">Recording...</span>
              <span className="text-sm text-red-500 font-mono tabular-nums">
                {formatTime(recordingTime)}
              </span>
              {/* Added explicit stop button */}
              <button
                type="button"
                onClick={stopRecording}
                className="ml-2 px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors"
                title="Stop recording"
              >
                Stop
              </button>
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
                    className="w-10 h-10 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors touch-manipulation"
                    title="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording} // Stop recording if mouse leaves while holding
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                    title="Hold to record voice message"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </form>

      <style jsx>{`
        .safe-area-padding {
          padding-bottom: max(16px, env(safe-area-inset-bottom)); /* Increased min padding */
        }
        .safe-area-padding-disabled {
          padding-bottom: max(16px, env(safe-area-inset-bottom)); /* Consistent padding for disabled state */
        }
        
        .ios-fix {
          -webkit-appearance: none;
          -webkit-border-radius: 0;
          border-radius: 9999px; /* Ensure rounded-full is applied consistently */
        }
        
        .touch-manipulation {
          touch-action: manipulation;
        }
        
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
        
        @media (max-width: 480px) {
          .ios-fix {
            font-size: 16px !important; /* Prevents unwanted zoom on iOS */
          }
        }
      `}</style>
    </div>
  );
}
