import React, { useEffect, useRef } from "react";
import { useVoiceStore } from "@/stores/voiceStore";

interface AudioPlayerProps {
  stream: MediaStream;
  isDeafened: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ stream, isDeafened }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
      audioRef.current.volume = isDeafened ? 0 : 1;
    }
  }, [stream, isDeafened]);

  return <audio ref={audioRef} autoPlay playsInline />;
};

const VoiceConnectionManager: React.FC = () => {
  const remoteStreams = useVoiceStore((state) => state.remoteStreams);
  const isDeafened = useVoiceStore((state) => state.isDeafened);

  if (remoteStreams.size === 0) {
    return null;
  }

  return (
    <div style={{ display: "none" }}>
      {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
        <AudioPlayer key={userId} stream={stream} isDeafened={isDeafened} />
      ))}
    </div>
  );
};

export default VoiceConnectionManager;
