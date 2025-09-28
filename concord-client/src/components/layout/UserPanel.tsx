import React, { useState } from "react";
import { Settings, Mic, MicOff, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { SAMPLE_USERS } from "@/hooks/useServers";

// Status color utility
const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-status-online";
    case "away":
      return "bg-status-away";
    case "busy":
      return "bg-status-busy";
    default:
      return "bg-status-offline";
  }
};

// User Status Dropdown Component
interface UserStatusDropdownProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  children: React.ReactNode;
}

const UserStatusDropdown: React.FC<UserStatusDropdownProps> = ({
  // currentStatus,
  onStatusChange,
  children,
}) => {
  const statusOptions = [
    { value: "online", label: "Online", color: "bg-status-online" },
    { value: "away", label: "Away", color: "bg-status-away" },
    { value: "busy", label: "Do Not Disturb", color: "bg-status-busy" },
    { value: "offline", label: "Invisible", color: "bg-status-offline" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="checkchekchek" asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        {statusOptions.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => onStatusChange(status.value)}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${status.color}`} />
              <span>{status.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => useUiStore.getState().openUserSettings()}
        >
          <Settings size={16} className="mr-2" />
          User Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => useAuthStore.getState().logout()}
          className="text-destructive focus:text-destructive"
        >
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Voice Controls Component
interface VoiceControlsProps {
  isMuted: boolean;
  isDeafened: boolean;
  onMuteToggle: () => void;
  onDeafenToggle: () => void;
  onSettingsClick: () => void;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isMuted,
  isDeafened,
  onMuteToggle,
  onDeafenToggle,
  onSettingsClick,
}) => {
  return (
    <div className="flex items-center space-x-1">
      <TooltipProvider>
        {/* Mute/Unmute */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isMuted ? "text-destructive hover:text-destructive/80" : "interactive-hover"}`}
              onClick={onMuteToggle}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMuted ? "Unmute" : "Mute"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Deafen/Undeafen */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isDeafened ? "text-destructive hover:text-destructive/80" : "interactive-hover"}`}
              onClick={onDeafenToggle}
            >
              <Headphones size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isDeafened ? "Undeafen" : "Deafen"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 interactive-hover"
              onClick={onSettingsClick}
            >
              <Settings size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>User Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

// User Avatar Component
interface UserAvatarProps {
  user: any;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "md",
  showStatus = true,
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const statusSizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={user.picture || undefined} alt={user.username} />
        <AvatarFallback className="text-xs text-primary-foreground bg-primary">
          {user.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 ${statusSizeClasses[size]} rounded-full border-2 border-sidebar ${getStatusColor(user.status)}`}
        />
      )}
    </div>
  );
};

// Main UserPanel Component
const UserPanel: React.FC = () => {
  const { user } = useAuthStore();
  const { openUserSettings } = useUiStore();

  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const displayUser = user || SAMPLE_USERS.find((u) => u.id === "current");

  if (!displayUser) {
    return (
      <div className="flex-shrink-0 p-2 bg-concord-tertiary">
        <div className="text-concord-secondary text-sm">No user data</div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    console.log("Status change to:", newStatus);
    // TODO: Implement API call to update user status
  };

  const handleMuteToggle = () => setIsMuted(!isMuted);
  const handleDeafenToggle = () => {
    const newDeafenState = !isDeafened;
    setIsDeafened(newDeafenState);
    if (newDeafenState) {
      setIsMuted(true); // Deafening also mutes
    }
  };

  return (
    <div className="user-panel flex items-center p-2 bg-concord-tertiary border-t border-sidebar">
      {/* User Info with Dropdown */}
      <UserStatusDropdown
        currentStatus={displayUser.status}
        onStatusChange={handleStatusChange}
      >
        <Button
          variant="ghost"
          className="flex-1 flex items-center h-auto p-1 rounded-md hover:bg-concord-secondary"
        >
          <UserAvatar user={displayUser} size="md" />
          <div className="ml-2 flex-1 min-w-0 text-left">
            <div className="text-sm font-medium text-concord-primary truncate">
              {displayUser.nickname || displayUser.username}
            </div>
            <div className="text-xs text-concord-secondary truncate capitalize">
              {displayUser.status}
            </div>
          </div>
        </Button>
      </UserStatusDropdown>

      {/* Voice Controls */}
      <VoiceControls
        isMuted={isMuted}
        isDeafened={isDeafened}
        onMuteToggle={handleMuteToggle}
        onDeafenToggle={handleDeafenToggle}
        onSettingsClick={openUserSettings}
      />
    </div>
  );
};

export default UserPanel;
