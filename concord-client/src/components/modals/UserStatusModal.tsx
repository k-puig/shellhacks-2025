import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import { useUiStore } from "@/stores/uiStore";

interface UserStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

export const UserStatusModal: React.FC<UserStatusModalProps> = ({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange,
}) => {
  const { mutate: logout } = useLogout();
  const { openUserSettings } = useUiStore();

  const statusOptions = [
    { value: "online", label: "Online", color: "bg-status-online" },
    { value: "away", label: "Away", color: "bg-status-away" },
    { value: "busy", label: "Do Not Disturb", color: "bg-status-busy" },
    { value: "offline", label: "Invisible", color: "bg-status-offline" },
  ];

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[250px]">
        <DialogHeader>
          <DialogTitle>Status & Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              variant={currentStatus === status.value ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleAction(() => onStatusChange(status.value))}
            >
              <div className={`w-3 h-3 rounded-full ${status.color} mr-2`} />
              {status.label}
            </Button>
          ))}

          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleAction(() => openUserSettings())}
            >
              <Settings className="h-4 w-4 mr-2" />
              User Settings
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => handleAction(() => logout())}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
