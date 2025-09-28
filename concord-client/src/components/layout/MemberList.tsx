// src/components/layout/MemberList.tsx - Enhanced with role management
import React, { useState } from "react";
import { useParams } from "react-router";
import { Crown, Shield, UserIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Role } from "@/types/database";
import { useInstanceMembers } from "@/hooks/useServers";
import { useAuthStore } from "@/stores/authStore";
import { User } from "@/types/database";

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

interface MemberItemProps {
  member: User;
  instanceId: string;
  isOwner?: boolean;
}

// Get the user's role for this specific instance
const getUserRoleForInstance = (roles: Role[], instanceId: string) => {
  return roles.find((r) => r.instanceId === instanceId)?.role || "member";
};

// Define role colors and priorities
const getRoleInfo = (role: string) => {
  switch (role) {
    case "admin":
      return { color: "#ff6b6b", priority: 3, name: "Admin" };
    case "mod":
      return { color: "#4ecdc4", priority: 2, name: "Moderator" };
    default:
      return { color: null, priority: 1, name: "Member" };
  }
};

const MemberItem: React.FC<MemberItemProps> = ({
  member,
  instanceId,
  isOwner = false,
}) => {
  const userRole = getUserRoleForInstance(member.roles, instanceId || "");
  const roleInfo = getRoleInfo(userRole);

  return (
    <>
      <Button
        variant="ghost"
        className="w-full justify-start p-2 h-auto hover:bg-concord-tertiary/50"
        disabled={member.admin}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={member.picture || undefined}
                alt={member.username}
              />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {member.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Status indicator */}
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-sidebar ${getStatusColor(member.status)}`}
            />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1">
              {isOwner && (
                <Crown size={12} className="text-yellow-500 flex-shrink-0" />
              )}
              {!isOwner && userRole !== "member" && (
                <Shield
                  size={12}
                  className="flex-shrink-0"
                  style={{ color: roleInfo.color || "var(--background)" }}
                />
              )}
              <span
                className="text-sm font-medium truncate"
                style={{ color: roleInfo.color || "var(--color-text-primary)" }}
              >
                {member.nickname || member.username}
              </span>
            </div>
            {member.bio && (
              <div className="text-xs text-concord-secondary truncate">
                {member.bio}
              </div>
            )}
          </div>
        </div>
      </Button>
    </>
  );
};

const MemberList: React.FC = () => {
  const { instanceId } = useParams();
  const { data: members, isLoading } = useInstanceMembers(instanceId);
  const { user: currentUser } = useAuthStore();

  const currentUserRole = React.useMemo(() => {
    if (!currentUser || !instanceId) return "member";
    if (currentUser.admin) return "admin";

    const userRole = currentUser.roles.find(
      (role) => role.instanceId === instanceId,
    );
    return userRole?.role || "member";
  }, [currentUser, instanceId]);

  if (!instanceId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-concord-secondary text-sm">No members</div>
      </div>
    );
  }

  // Group members by role
  const groupedMembers = members.reduce(
    (acc, member) => {
      const userRole =
        member.roles.find((r) => r.instanceId === instanceId)?.role || "member";
      const roleInfo = getRoleInfo(userRole);

      if (!acc[roleInfo.name]) {
        acc[roleInfo.name] = [];
      }
      acc[roleInfo.name].push(member);
      return acc;
    },
    {} as Record<string, User[]>,
  );

  // Sort role groups by priority (admin > mod > member)
  const sortedRoleGroups = Object.entries(groupedMembers).sort(
    ([roleNameA], [roleNameB]) => {
      const priorityA = getRoleInfo(roleNameA.toLowerCase())?.priority || 1;
      const priorityB = getRoleInfo(roleNameB.toLowerCase())?.priority || 1;
      return priorityB - priorityA;
    },
  );

  return (
    <div className="flex flex-col flex-1 border-l border-concord-primary h-full bg-concord-secondary">
      {/* Header */}
      <div className="px-4 py-3 border-b border-concord-primary flex items-center justify-between">
        <UserIcon size={20} className="text-concord-primary h-8" />
        <p className="text-sm font-semibold text-concord-secondary tracking-wide">
          {members.length} Members
        </p>
      </div>

      {/* Member List */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {sortedRoleGroups.map(([roleName, roleMembers]) => (
            <div key={roleName} className="mb-4">
              {/* Role Header */}
              <div className="px-4 py-1">
                <h4 className="text-xs font-semibold text-concord-secondary uppercase tracking-wide">
                  {roleName} — {roleMembers.length}
                </h4>
              </div>

              {/* Role Members */}
              <div className="space-y-1">
                {roleMembers
                  .sort((a, b) => a.username.localeCompare(b.username))
                  .map((member) => (
                    <MemberItem
                      key={member.id}
                      member={member}
                      instanceId={instanceId}
                      currentUserRole={currentUserRole}
                      isOwner={false}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MemberList;
