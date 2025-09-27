import React from "react";
import {
  Avatar as ShadcnAvatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { User } from "@/types/database";
import { cn } from "@/lib/utils";

interface AvatarProps {
  user: Pick<User, "id" | "username" | "nickname" | "picture" | "status">;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const statusSizes = {
  xs: "w-2 h-2",
  sm: "w-3 h-3",
  md: "w-3 h-3",
  lg: "w-4 h-4",
  xl: "w-5 h-5",
};

const statusPositions = {
  xs: "-bottom-0.5 -right-0.5",
  sm: "-bottom-0.5 -right-0.5",
  md: "-bottom-0.5 -right-0.5",
  lg: "-bottom-1 -right-1",
  xl: "-bottom-1 -right-1",
};

const Avatar: React.FC<AvatarProps> = ({
  user,
  size = "md",
  showStatus = false,
  className,
  onClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      case "offline":
      default:
        return "bg-gray-500";
    }
  };

  const getUserInitials = (username: string, nickname?: string) => {
    const name = nickname || username;
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getFallbackColor = (userId: string) => {
    // Generate a consistent color based on user ID
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];

    const hash = userId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="relative inline-block">
      <ShadcnAvatar
        className={cn(
          sizeClasses[size],
          onClick && "cursor-pointer hover:opacity-80 transition-opacity",
          className,
        )}
        onClick={onClick}
      >
        <AvatarImage
          src={user.picture || undefined}
          alt={user.nickname || user.username}
        />
        <AvatarFallback
          className={cn(
            "text-white font-medium",
            getFallbackColor(user.id),
            size === "xs" && "text-xs",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
            size === "xl" && "text-lg",
          )}
        >
          {getUserInitials(user.username, user.nickname)}
        </AvatarFallback>
      </ShadcnAvatar>

      {showStatus && (
        <div
          className={cn(
            "absolute rounded-full border-2 border-gray-800",
            statusSizes[size],
            statusPositions[size],
            getStatusColor(user.status),
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
