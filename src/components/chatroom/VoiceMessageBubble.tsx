import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";

interface VoiceWaveformBubbleProps {
  src: string;
  className?: string;
}

export default function VoiceWaveformBubble({ src, className }: VoiceWaveformBubbleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn("Web Audio API is not supported in this browser.");
      return;
    }

    // Create and configure <audio> element
    const audioEl = new Audio();
    audioEl.controls = false;
    audioRef.current = audioEl;

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#d1d5db",
      progressColor: "#ffdb0d",
      height: 32,
      barWidth: 2,
      cursorWidth: 0,
      normalize: true,
      backend: "MediaElement",
      media: audioEl, // Pass the audio element directly
    });

    wavesurfer.on("finish", () => setIsPlaying(false));
    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
      wavesurferRef.current = null;
      audioRef.current = null;
    };
  }, []);

  // Load new audio source
  useEffect(() => {
    const audio = audioRef.current;
    const wavesurfer = wavesurferRef.current;
    if (!audio || !wavesurfer) return;

    setIsPlaying(false);
    wavesurfer.stop(); // Stop current playback before reloading

    try {
      audio.src = src;
      // Reloading <audio> source automatically works with MediaElement backend
      audio.load();
    } catch (err) {
      console.error("Audio load error:", err);
    }
  }, [src]);

  const togglePlayback = () => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer) return;

    if (isPlaying) {
      wavesurfer.pause();
    } else {
      wavesurfer.play();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`flex items-center gap-3 max-w-xs ${className || ""}`}>
      <button
        onClick={togglePlayback}
        className="p-2 text-white rounded-full"
        style={{ backgroundColor: "#ffdb0b" }}
      >
        {isPlaying ? <Pause size={20} color="gray" /> : <Play size={20} color="gray" />}
      </button>
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
