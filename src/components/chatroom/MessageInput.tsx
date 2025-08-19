"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

interface MessageInputProps {
  chatroomId: string;
  onSendMessage: (message: string | { type: "audio" | "image"; url: string; messageId?: string }) => void;
}

export function MessageInput({ chatroomId, onSendMessage }: MessageInputProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const uploadMediaToAPI = async (file: File | Blob, messageId: string, mediaType: "audio" | "image") => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatroomId', chatroomId);
    formData.append('messageId', messageId);
    formData.append('mediaType', mediaType);
    formData.append('userId', user.id);

    const response = await fetch('/api/upload/chat-media', {
      method: 'POST',
      body: formData,
    });

    return response.json();
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          
          setUploading(true);
          
          // Generate a temporary message ID for the upload
          const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          try {
            const result = await uploadMediaToAPI(audioBlob, messageId, "audio");
            
            if (result.error) {
              console.error("Audio upload failed:", result.error);
              // Fallback to blob URL
              const audioURL = URL.createObjectURL(audioBlob);
              onSendMessage({ type: "audio", url: audioURL });
            } else if (result.url) {
              onSendMessage({ type: "audio", url: result.url, messageId });
            }
          } catch (error) {
            console.error("Audio upload error:", error);
            // Fallback to blob URL
            const audioURL = URL.createObjectURL(audioBlob);
            onSendMessage({ type: "audio", url: audioURL });
          } finally {
            setUploading(false);
          }

          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setRecording(true);
      } catch (err) {
        console.error("Microphone access denied", err);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUploading(true);
      
      // Generate a temporary message ID for the upload
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        const result = await uploadMediaToAPI(file, messageId, "image");
        
        if (result.error) {
          console.error("Image upload failed:", result.error);
          // Fallback to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            onSendMessage({ type: "image", url: reader.result as string });
          };
          reader.readAsDataURL(file);
        } else if (result.url) {
          onSendMessage({ type: "image", url: result.url, messageId });
        }
      } catch (error) {
        console.error("Image upload error:", error);
        // Fallback to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          onSendMessage({ type: "image", url: reader.result as string });
        };
        reader.readAsDataURL(file);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200">
      <div className="flex items-center gap-3 p-4">

        {/* Image Upload Button */}
        <label className={`flex items-center justify-center w-8 h-8 rounded-full cursor-pointer ${
          uploading ? "text-blue-500" : "text-gray-400 hover:text-gray-600"
        }`}>
          {uploading ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploading}
          />
        </label>

        {/* Text Input */}
        <div className="flex-1">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Voice Recording Button */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            recording ? "text-red-500" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
