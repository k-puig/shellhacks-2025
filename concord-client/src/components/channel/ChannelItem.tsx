import React from "react";
import { Hash, Volume2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Channel } from "@/lib/api-client";
import { useVoiceStore } from "@/stores/voiceStore";
import { useInstanceMembers } from "@/hooks/useServers";
import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChannelItemProps {
  channel: Channel;
}

const ChannelItem: React.FC<ChannelItemProps> = ({ channel }) => {
  const { instanceId, channelId: activeChannelId } = useParams();
  const navigate = useNavigate();

  // Voice store hooks
  const {
    joinChannel,
    leaveChannel,
    activeVoiceChannelId,
    remoteStreams,
    localStream,
  } = useVoiceStore();

  // Data hooks
  const { data: members } = useInstanceMembers(instanceId);
  const { user: currentUser, token } = useAuthStore(); // Get token from auth store

  const isConnectedToThisChannel = activeVoiceChannelId === channel.id;
  const isActive = activeChannelId === channel.id;

  const handleChannelClick = () => {
    if (channel.type === "text") {
      navigate(`/channels/${instanceId}/${channel.id}`);
    } else if (channel.type === "voice") {
      if (isConnectedToThisChannel) {
        leaveChannel();
      } else if (currentUser && token) {
        console.log({
          channelId: channel.id,
          currentUser: currentUser.id,
          token: token,
        });
        joinChannel(channel.id, currentUser.id, token);
      }
    }
  };

  const Icon = channel.type === "voice" ? Volume2 : Hash;
  const connectedUserIds = Array.from(remoteStreams.keys());

  return (
    <div>
      <button
        onClick={handleChannelClick}
        className={`w-full flex items-center p-1.5 rounded-md text-left transition-colors ${
          isActive || isConnectedToThisChannel
            ? "bg-concord-secondary text-concord-primary"
            : "text-concord-secondary hover:bg-concord-secondary/50 hover:text-concord-primary"
        }`}
      >
        <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
        <span className="truncate flex-1">{channel.name}</span>
      </button>

      {/* Render connected users for this voice channel */}
      {isConnectedToThisChannel && (
        <div className="pl-4 mt-1 space-y-1">
          {/* Current User */}
          {localStream && currentUser && (
            <div className="flex items-center p-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={currentUser.picture || ""} />
                <AvatarFallback>
                  {currentUser.username.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2 text-sm text-concord-primary">
                {currentUser.nickname || currentUser.username}
              </span>
            </div>
          )}

          {/* Remote Users */}
          {connectedUserIds.map((userId) => {
            const member = members?.find((m) => m.id === userId);
            if (!member) return null;
            return (
              <div key={userId} className="flex items-center p-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={member.picture || ""} />
                  <AvatarFallback>{member.username.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="ml-2 text-sm text-concord-primary">
                  {member.nickname || member.username}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChannelItem;
