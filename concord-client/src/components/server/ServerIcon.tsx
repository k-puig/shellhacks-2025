import React from "react";
import { Button } from "@/components/ui/button";
import { Instance } from "@/types/database";

interface ServerIconProps {
  server: Instance;
  isActive: boolean;
  onClick: () => void;
}

const ServerIcon: React.FC<ServerIconProps> = ({
  server,
  isActive,
  onClick,
}) => {
  const getServerInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative group">
      {/* Active indicator */}
      <div
        className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 bg-white rounded-r transition-all duration-200 ${
          isActive ? "h-10" : "h-2 group-hover:h-5"
        }`}
      />

      <Button
        variant="ghost"
        size="icon"
        className={`w-12 h-12 ml-3 transition-all duration-200 ${
          isActive
            ? "rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
            : "rounded-2xl hover:rounded-xl bg-gray-700 hover:bg-blue-600 text-gray-300 hover:text-white"
        }`}
        onClick={onClick}
      >
        {server.icon ? (
          <img
            src={server.icon}
            alt={server.name}
            className="w-full h-full object-cover rounded-inherit"
          />
        ) : (
          <span className="font-semibold text-sm">
            {getServerInitials(server.name)}
          </span>
        )}
      </Button>
    </div>
  );
};

export default ServerIcon;
