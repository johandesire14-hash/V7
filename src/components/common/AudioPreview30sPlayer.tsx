import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Radio,
  Clock,
  Sparkles,
} from "lucide-react";

interface AudioPreview30sPlayerProps {
  src?: string;
  title?: string;
  artist?: string;
  variant?: "compact" | "full" | "minimal";
  className?: string;
  maxSeconds?: number; // strictly 30 seconds by default
}

export const AudioPreview30sPlayer: React.FC<AudioPreview30sPlayerProps> = ({
  src,
  title = "Extrait Musical Démo",
  artist = "Afhub Music Studio",
  variant = "full",
  className = "",
  maxSeconds = 30,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [hasEnded, setHasEnded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Web Audio Synth Fallback (when no external src or local file)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    gainNode: GainNode | null;
    oscillatorTimer: NodeJS.Timeout | null;
    intervals: NodeJS.Timeout[];
  }>({
    gainNode: null,
    oscillatorTimer: null,
    intervals: [],
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSynth();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Web Audio Synth Player (Creates a pleasant 30s Afro-Chords & Melodic Groove)
  const startSynth = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioCtxClass();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.35, ctx.currentTime);
      masterGain.connect(ctx.destination);
      synthNodesRef.current.gainNode = masterGain;

      // Chord progression in F minor / Pentatonic (F3, Ab3, C4, Eb4) & gentle beat
      const chords = [
        [174.61, 207.65, 261.63, 311.13], // Fm7
        [155.56, 196.0, 233.08, 311.13],  // Eb
        [130.81, 164.81, 196.0, 261.63],  // Cm7
        [116.54, 146.83, 174.61, 233.08], // Bb
      ];

      const playChord = (frequencies: number[], startTime: number, duration: number) => {
        frequencies.forEach((freq) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, startTime);

          noteGain.gain.setValueAtTime(0.001, startTime);
          noteGain.gain.linearRampToValueAtTime(0.12, startTime + 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.05);

          osc.connect(noteGain);
          noteGain.connect(masterGain);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });

        // Add soft kick/percussion pulse
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.type = "sine";
        kickOsc.frequency.setValueAtTime(120, startTime);
        kickOsc.frequency.exponentialRampToValueAtTime(38, startTime + 0.15);

        kickGain.gain.setValueAtTime(0.3, startTime);
        kickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        kickOsc.connect(kickGain);
        kickGain.connect(masterGain);

        kickOsc.start(startTime);
        kickOsc.stop(startTime + 0.2);
      };

      let step = 0;
      const intervalId = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state !== "running") return;
        const currentChord = chords[step % chords.length];
        playChord(currentChord, ctx.currentTime, 0.9);
        step++;
      }, 750); // 80 BPM tempo

      synthNodesRef.current.intervals.push(intervalId);
    } catch (err) {
      console.warn("Web Audio preview synth initialized with silent fallback:", err);
    }
  };

  const stopSynth = () => {
    synthNodesRef.current.intervals.forEach((id) => clearInterval(id));
    synthNodesRef.current.intervals = [];
    if (synthNodesRef.current.gainNode && audioCtxRef.current) {
      try {
        synthNodesRef.current.gainNode.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      } catch {}
    }
  };

  // Timer loop tracking up to maxSeconds (30s)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= maxSeconds - 0.2) {
            handlePause();
            setHasEnded(true);
            return maxSeconds;
          }
          return prev + 0.2;
        });
      }, 200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, maxSeconds]);

  // Handle Real Audio playback if src exists
  useEffect(() => {
    if (src && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    if (synthNodesRef.current.gainNode && audioCtxRef.current) {
      try {
        synthNodesRef.current.gainNode.gain.setValueAtTime(
          isMuted ? 0 : volume * 0.35,
          audioCtxRef.current.currentTime
        );
      } catch {}
    }
  }, [volume, isMuted]);

  const handlePlay = async () => {
    setHasEnded(false);
    if (currentTime >= maxSeconds) {
      setCurrentTime(0);
    }

    if (src && audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        // Fallback to Web Audio Synth if autoplay or media fails
        startSynth();
        setIsPlaying(true);
      }
    } else {
      startSynth();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (src && audioRef.current) {
      audioRef.current.pause();
    }
    stopSynth();
  };

  const handleReset = () => {
    handlePause();
    setCurrentTime(0);
    setHasEnded(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.min(100, (currentTime / maxSeconds) * 100);

  // 24 Dynamic waveform bars
  const waveformHeights = [
    30, 45, 65, 85, 55, 70, 95, 80, 60, 40, 75, 90,
    100, 80, 65, 50, 75, 90, 60, 45, 85, 70, 50, 35
  ];

  // ===========================================================================
  // VARIANT: MINIMAL (Pill player)
  // ===========================================================================
  if (variant === "minimal") {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181a24] border border-[#00D26A]/30 text-xs font-mono text-white ${className}`}>
        <button
          type="button"
          onClick={isPlaying ? handlePause : handlePlay}
          className="size-6 rounded-full bg-[#00D26A] text-black flex items-center justify-center cursor-pointer hover:bg-emerald-400 transition-transform active:scale-95"
          aria-label={isPlaying ? "Pause" : "Écouter 30s"}
        >
          {isPlaying ? <Pause className="size-3 fill-current" /> : <Play className="size-3 fill-current ml-0.5" />}
        </button>
        <span className="text-[11px] font-bold text-[#00D26A]">
          {formatTime(currentTime)} / 00:30
        </span>
        <span className="text-[10px] text-zinc-400">Extrait 30s</span>
      </div>
    );
  }

  // ===========================================================================
  // VARIANT: COMPACT (For file cards & lists)
  // ===========================================================================
  if (variant === "compact") {
    return (
      <div className={`p-3 rounded-xl bg-[#141720] border border-white/10 space-y-2.5 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-lg bg-[#00D26A]/15 border border-[#00D26A]/30 flex items-center justify-center text-[#00D26A] shrink-0">
              <Music className="size-4" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-white text-xs truncate block">{title}</span>
              <span className="text-[10px] text-zinc-400 block truncate">{artist} · Écoute 30s max</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#00D26A]/20 text-[#00D26A] font-bold">
              30s Démo
            </span>
          </div>
        </div>

        {/* Player controls bar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={isPlaying ? handlePause : handlePlay}
            className="size-7 rounded-full bg-[#00D26A] text-black flex items-center justify-center cursor-pointer hover:bg-emerald-400 transition-all shrink-0 active:scale-95 shadow-sm"
          >
            {isPlaying ? <Pause className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current ml-0.5" />}
          </button>

          {/* Mini Waveform & scrubber */}
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min={0}
              max={maxSeconds}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00D26A]"
            />
          </div>

          <span className="text-[10px] font-mono text-zinc-400 shrink-0">
            {formatTime(currentTime)} / 00:30
          </span>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // VARIANT: FULL (Complete Studio & Product Page Experience)
  // ===========================================================================
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-gradient-to-b from-[#161922] to-[#101218] p-4 sm:p-5 shadow-xl space-y-4 ${className}`}
    >
      {/* Top Header: Badge, Title & Timing */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-xl bg-[#00D26A]/15 border border-[#00D26A]/30 flex items-center justify-center text-[#00D26A] shrink-0">
            <Radio className={`size-4.5 ${isPlaying ? "animate-pulse" : ""}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">{title}</h4>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              {artist} · <span className="text-zinc-500">Extrait promotionnel non-téléchargeable</span>
            </p>
          </div>
        </div>

        {/* Counter */}
        <div className="text-right shrink-0">
          <div className="text-xs sm:text-sm font-mono font-bold text-[#00D26A]">
            {formatTime(currentTime)}
            <span className="text-zinc-500 text-[11px] font-normal"> / 00:{maxSeconds}</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            {hasEnded ? "Extrait terminé" : isPlaying ? "Lecture en cours" : "Prêt"}
          </span>
        </div>
      </div>

      {/* Animated Sound Waveform Bars */}
      <div className="rounded-xl bg-[#0c0d12] border border-white/5 p-3.5 flex items-center justify-between gap-1 sm:gap-1.5 h-16 sm:h-20 overflow-hidden relative group">
        {/* Visualizer bars */}
        {waveformHeights.map((h, i) => {
          const barProgress = (i / waveformHeights.length) * maxSeconds;
          const isPassed = currentTime >= barProgress;
          const animatedHeight = isPlaying
            ? Math.max(15, (h * ((i + Math.floor(currentTime * 4)) % 5 + 1)) / 5)
            : h * 0.45;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col justify-center items-center h-full cursor-pointer"
              onClick={() => {
                const targetTime = (i / waveformHeights.length) * maxSeconds;
                setCurrentTime(targetTime);
                if (audioRef.current) audioRef.current.currentTime = targetTime;
              }}
            >
              <div
                style={{ height: `${animatedHeight}%` }}
                className={`w-full max-w-[5px] rounded-full transition-all duration-150 ${
                  isPassed
                    ? "bg-[#00D26A]"
                    : "bg-zinc-700/60 hover:bg-zinc-600"
                }`}
              />
            </div>
          );
        })}

        {/* 30s Limit Marker Line */}
        <div className="absolute right-3 top-2 bottom-2 w-0.5 bg-amber-400/40 border-r border-dashed border-amber-400 flex flex-col justify-between items-end pr-1 pointer-events-none">
          <span className="text-[9px] font-mono text-amber-400/90 font-bold">Max 30s</span>
        </div>
      </div>

      {/* Scrubber Progress Slider */}
      <div className="space-y-1">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={maxSeconds}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00D26A]"
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-zinc-500">
          <span>00:00</span>
          <span className="text-amber-400 font-semibold">Limite stricte 30 secondes</span>
          <span>00:{maxSeconds}</span>
        </div>
      </div>

      {/* Playback Controls & Volume */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          {/* Main Play / Pause Button */}
          <button
            type="button"
            onClick={isPlaying ? handlePause : handlePlay}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00D26A] hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="size-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="size-4 fill-current" />
                <span>{currentTime > 0 && !hasEnded ? "Reprendre" : "Écouter l'extrait (30s)"}</span>
              </>
            )}
          </button>

          {/* Reset / Replay */}
          <button
            type="button"
            onClick={handleReset}
            className="size-8 rounded-lg border border-white/10 bg-[#1a1d26] hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Recommencer depuis le début"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>

        {/* Volume & Audio Settings */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="text-zinc-400 hover:text-white cursor-pointer p-1 rounded hover:bg-white/5"
            title={isMuted ? "Activer le son" : "Couper le son"}
          >
            {isMuted ? <VolumeX className="size-4 text-red-400" /> : <Volume2 className="size-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setIsMuted(false);
              setVolume(parseFloat(e.target.value));
            }}
            className="w-16 sm:w-20 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00D26A]"
            aria-label="Volume de l'extrait"
          />
        </div>
      </div>

      {/* Hidden HTML Audio element for real file previews */}
      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onTimeUpdate={() => {
            if (audioRef.current) {
              if (audioRef.current.currentTime >= maxSeconds) {
                handlePause();
                setHasEnded(true);
                setCurrentTime(maxSeconds);
              } else {
                setCurrentTime(audioRef.current.currentTime);
              }
            }
          }}
          onEnded={() => {
            handlePause();
            setHasEnded(true);
            setCurrentTime(maxSeconds);
          }}
        />
      )}
    </div>
  );
};
