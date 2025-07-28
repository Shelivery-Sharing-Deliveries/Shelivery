import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";

interface VoiceWaveformBubbleProps {
  src: string;
  className?: string;
}

export default function VoiceWaveformBubble({ src, className }: VoiceWaveformBubbleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize WaveSurfer once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#d1d5db",
      progressColor: "#ffdb0d",
      height: 32,
      barWidth: 2,
      cursorWidth: 0,
      normalize: true,
    });

    wavesurfer.on("finish", () => setIsPlaying(false));
    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
      wavesurferRef.current = null;
    };
  }, []);

  // Load new audio src when changed
useEffect(() => {
  const wavesurfer = wavesurferRef.current;
  if (!wavesurfer) return;

  let isCancelled = false;

  const loadAudio = async () => {
    try {
      setIsPlaying(false);
      await wavesurfer.load(src);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.warn("WaveSurfer load aborted.");
      } else {
        console.error("WaveSurfer load error:", err);
      }
    }
  };

  loadAudio();

  return () => {
    isCancelled = true;
  };
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
