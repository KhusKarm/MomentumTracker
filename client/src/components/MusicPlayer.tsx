import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Music, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as Tone from "tone";

type MusicTheme = "calm" | "focus" | "energize";

const themes: Record<MusicTheme, { name: string; description: string }> = {
  calm: { name: "Calm Sea", description: "Gentle piano melodies" },
  focus: { name: "Deep Focus", description: "Ambient soundscapes" },
  energize: { name: "Energize", description: "Upbeat rhythms" },
};

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<MusicTheme>("calm");
  const [audioStarted, setAudioStarted] = useState(false);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);

  useEffect(() => {
    return () => {
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current.dispose();
      }
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, []);

  const initAudio = async () => {
    if (!audioStarted) {
      await Tone.start();
      setAudioStarted(true);
    }
  };

  const createCalmTheme = () => {
    if (synthRef.current) {
      synthRef.current.dispose();
    }

    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: {
        attack: 1,
        decay: 0.5,
        sustain: 0.3,
        release: 2,
      },
    }).toDestination();

    const notes = ["C4", "E4", "G4", "A4", "C5"];
    let noteIndex = 0;

    if (loopRef.current) {
      loopRef.current.dispose();
    }

    loopRef.current = new Tone.Loop((time) => {
      synthRef.current?.triggerAttackRelease(notes[noteIndex], "2n", time);
      noteIndex = (noteIndex + 1) % notes.length;
    }, "2n");
  };

  const createFocusTheme = () => {
    if (synthRef.current) {
      synthRef.current.dispose();
    }

    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.5,
        release: 3,
      },
    }).toDestination();

    const chords = [
      ["C3", "E3", "G3"],
      ["A2", "C3", "E3"],
      ["F2", "A2", "C3"],
      ["G2", "B2", "D3"],
    ];
    let chordIndex = 0;

    if (loopRef.current) {
      loopRef.current.dispose();
    }

    loopRef.current = new Tone.Loop((time) => {
      synthRef.current?.triggerAttackRelease(chords[chordIndex], "1n", time);
      chordIndex = (chordIndex + 1) % chords.length;
    }, "1n");
  };

  const createEnergizeTheme = () => {
    if (synthRef.current) {
      synthRef.current.dispose();
    }

    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "square" },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.4,
        release: 0.5,
      },
    }).toDestination();

    const pattern = ["C4", "D4", "E4", "G4", "A4", "G4", "E4", "D4"];
    let patternIndex = 0;

    if (loopRef.current) {
      loopRef.current.dispose();
    }

    loopRef.current = new Tone.Loop((time) => {
      synthRef.current?.triggerAttackRelease(pattern[patternIndex], "8n", time);
      patternIndex = (patternIndex + 1) % pattern.length;
    }, "8n");
  };

  const handlePlayPause = async () => {
    await initAudio();

    if (!isPlaying) {
      switch (currentTheme) {
        case "calm":
          createCalmTheme();
          break;
        case "focus":
          createFocusTheme();
          break;
        case "energize":
          createEnergizeTheme();
          break;
      }

      Tone.getTransport().start();
      loopRef.current?.start(0);
      setIsPlaying(true);
    } else {
      Tone.getTransport().stop();
      loopRef.current?.stop();
      setIsPlaying(false);
    }
  };

  const handleMuteToggle = () => {
    if (synthRef.current) {
      synthRef.current.volume.value = isMuted ? 0 : -Infinity;
      setIsMuted(!isMuted);
    }
  };

  const handleThemeChange = async (theme: MusicTheme) => {
    const wasPlaying = isPlaying;
    
    if (isPlaying) {
      Tone.getTransport().stop();
      loopRef.current?.stop();
      setIsPlaying(false);
    }

    setCurrentTheme(theme);

    if (wasPlaying) {
      await initAudio();
      
      switch (theme) {
        case "calm":
          createCalmTheme();
          break;
        case "focus":
          createFocusTheme();
          break;
        case "energize":
          createEnergizeTheme();
          break;
      }

      Tone.getTransport().start();
      loopRef.current?.start(0);
      setIsPlaying(true);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              data-testid="button-music-play"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPlaying ? "Pause Music" : "Play Music"}
          </TooltipContent>
        </Tooltip>

        {isPlaying && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMuteToggle}
                  data-testid="button-music-mute"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMuted ? "Unmute" : "Mute"}
              </TooltipContent>
            </Tooltip>

            <div className="flex gap-1">
              {(Object.keys(themes) as MusicTheme[]).map((theme) => (
                <Tooltip key={theme}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={currentTheme === theme ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleThemeChange(theme)}
                      className="text-xs px-2"
                      data-testid={`button-theme-${theme}`}
                    >
                      <Music className="h-3 w-3 mr-1" />
                      {themes[theme].name}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {themes[theme].description}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
