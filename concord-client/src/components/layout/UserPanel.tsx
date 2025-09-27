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

const UserPanel: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { openUserSettings } = useUiStore();

  // Voice/Audio states (for future implementation)
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleStatusChange = (newStatus: string) => {
    // TODO: Implement status change
    console.log("Status change to:", newStatus);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // TODO: Implement actual mute functionality
  };

  const handleDeafenToggle = () => {
    setIsDeafened(!isDeafened);
    if (!isDeafened) {
      setIsMuted(true); // Deafening also mutes
    }
    // TODO: Implement actual deafen functionality
  };

  return (
    <div className="flex items-center justify-between px-2 py-2 bg-gray-900 border-t border-gray-700">
      {/* User Info */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center space-x-2 p-1 h-auto hover:bg-gray-700"
          >
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.picture} alt={user.username} />
                <AvatarFallback className="text-xs bg-blue-600">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Status indicator */}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(user.status)}`}
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium text-white truncate">
                {user.nickname || user.username}
              </div>
              <div className="text-xs text-gray-400 truncate capitalize">
                {user.status}
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => handleStatusChange("online")}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Online</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("away")}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Away</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("busy")}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Do Not Disturb</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("offline")}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span>Invisible</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={openUserSettings}>
            <Settings size={16} className="mr-2" />
            User Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={logout}
            className="text-red-400 focus:text-red-400"
          >
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Voice Controls */}
      <div className="flex items-center space-x-1">
        <TooltipProvider>
          {/* Mute/Unmute */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isMuted ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-white"}`}
                onClick={handleMuteToggle}
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
                className={`h-8 w-8 ${isDeafened ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-white"}`}
                onClick={handleDeafenToggle}
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
                className="h-8 w-8 text-gray-400 hover:text-white"
                onClick={openUserSettings}
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
    </div>
  );
};

export default UserPanel;
