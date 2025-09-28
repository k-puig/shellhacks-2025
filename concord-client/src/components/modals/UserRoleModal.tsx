import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, Shield, User, AlertTriangle } from "lucide-react";
import { User as UserType } from "@/types/database";

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  instanceId: string;
  currentUserRole: string;
  canManageRoles: boolean;
}

export const UserRoleModal: React.FC<UserRoleModalProps> = ({
  isOpen,
  onClose,
  user,
  instanceId,
  currentUserRole,
  canManageRoles,
}) => {
  const userInstanceRole =
    user.roles.find((r) => r.instanceId === instanceId)?.role || "member";
  const [selectedRole, setSelectedRole] = useState(userInstanceRole);
  const [isUpdating, setIsUpdating] = useState(false);

  const roleOptions = [
    {
      value: "member",
      label: "Member",
      icon: User,
      description: "Standard server access",
    },
    {
      value: "mod",
      label: "Moderator",
      icon: Shield,
      description: "Can moderate channels and manage messages",
    },
    {
      value: "admin",
      label: "Admin",
      icon: Crown,
      description: "Full server management access",
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "mod":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleUpdateRole = async () => {
    if (selectedRole === userInstanceRole || !canManageRoles) return;

    setIsUpdating(true);
    try {
      // TODO: Implement actual role update API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(
        `Updating ${user.username}'s role to ${selectedRole} in instance ${instanceId}`,
      );
      // await userClient.updateRole({
      //   userId: user.id,
      //   instanceId,
      //   role: selectedRole,
      //   requestingUserId: currentUser.id,
      //   token: authStore.token
      // });

      onClose();
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKickUser = async () => {
    if (!canManageRoles) return;

    if (
      confirm(
        `Are you sure you want to kick ${user.nickname || user.username} from this server?`,
      )
    ) {
      try {
        // TODO: Implement kick user API call
        console.log(`Kicking ${user.username} from instance ${instanceId}`);
        onClose();
      } catch (error) {
        console.error("Failed to kick user:", error);
      }
    }
  };

  const canModifyUser =
    canManageRoles && !user.admin && userInstanceRole !== "admin";
  const isOwnProfile = false; // TODO: Check if this is the current user's profile

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Manage User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.picture || undefined} />
              <AvatarFallback>
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {user.nickname || user.username}
                </span>
                {user.admin && <Crown className="h-4 w-4 text-yellow-500" />}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getRoleColor(userInstanceRole)}>
                  {userInstanceRole}
                </Badge>
                <div
                  className={`w-2 h-2 rounded-full ${
                    user.status === "online"
                      ? "bg-green-500"
                      : user.status === "away"
                        ? "bg-yellow-500"
                        : user.status === "busy"
                          ? "bg-red-500"
                          : "bg-gray-500"
                  }`}
                />
                <span className="text-sm text-muted-foreground capitalize">
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          {user.bio && (
            <div className="text-sm text-muted-foreground">{user.bio}</div>
          )}

          <Separator />

          {/* Role Management */}
          {canModifyUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Server Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => {
                      const Icon = role.icon;
                      return (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {role.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateRole}
                  disabled={selectedRole === userInstanceRole || isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? "Updating..." : "Update Role"}
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>

              <Separator />

              {/* Danger Zone */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <Label className="text-destructive">Danger Zone</Label>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleKickUser}
                  className="w-full"
                  disabled={isUpdating}
                >
                  Kick from Server
                </Button>
              </div>
            </div>
          )}

          {/* View Only Mode */}
          {!canModifyUser && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                {user.admin
                  ? "System administrators cannot be modified"
                  : "You don't have permission to modify this user"}
              </p>
              <Button variant="outline" onClick={onClose} className="mt-4">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
