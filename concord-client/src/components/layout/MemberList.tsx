import React from "react";
import { useParams } from "react-router";
import { Crown, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInstanceMembers } from "@/hooks/useServers";
import { UserWithRoles } from "@/types/api";

interface MemberItemProps {
  member: UserWithRoles;
  isOwner?: boolean;
}

const MemberItem: React.FC<MemberItemProps> = ({ member, isOwner = false }) => {
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

  const getHighestRole = (roles: any[]) => {
    if (!roles || roles.length === 0) return null;
    // Sort by position (higher position = higher role)
    return roles.sort((a, b) => b.position - a.position)[0];
  };

  const highestRole = getHighestRole(member.roles);

  return (
    <div className="flex items-center px-2 py-1 mx-2 rounded hover:bg-gray-700/50 cursor-pointer group">
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.picture} alt={member.username} />
          <AvatarFallback className="text-xs">
            {member.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Status indicator */}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(member.status)}`}
        />
      </div>

      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center gap-1">
          {isOwner && (
            <Crown size={12} className="text-yellow-500 flex-shrink-0" />
          )}
          {!isOwner && highestRole && (
            <Shield
              size={12}
              className="flex-shrink-0"
              style={{ color: highestRole.color || "#ffffff" }}
            />
          )}
          <span
            className="text-sm font-medium truncate"
            style={{ color: highestRole?.color || "#ffffff" }}
          >
            {member.nickname || member.username}
          </span>
        </div>
        {member.bio && (
          <div className="text-xs text-gray-400 truncate">{member.bio}</div>
        )}
      </div>
    </div>
  );
};

const MemberList: React.FC = () => {
  const { instanceId } = useParams();
  const { members, isLoading } = useInstanceMembers(instanceId);

  if (!instanceId || instanceId === "@me") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 text-sm">No members</div>
      </div>
    );
  }

  // Group members by role
  const groupedMembers = members.reduce(
    (acc, member) => {
      const highestRole =
        member.roles?.length > 0
          ? member.roles.sort((a, b) => b.position - a.position)[0]
          : null;

      const roleName = highestRole?.name || "Members";

      if (!acc[roleName]) {
        acc[roleName] = [];
      }
      acc[roleName].push(member);
      return acc;
    },
    {} as Record<string, UserWithRoles[]>,
  );

  // Sort role groups by highest role position
  const sortedRoleGroups = Object.entries(groupedMembers).sort(
    ([roleNameA, membersA], [roleNameB, membersB]) => {
      const roleA = membersA[0]?.roles?.find((r) => r.name === roleNameA);
      const roleB = membersB[0]?.roles?.find((r) => r.name === roleNameB);

      if (!roleA && !roleB) return 0;
      if (!roleA) return 1;
      if (!roleB) return -1;

      return roleB.position - roleA.position;
    },
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Members — {members.length}
        </h3>
      </div>

      {/* Member List */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {sortedRoleGroups.map(([roleName, roleMembers]) => (
            <div key={roleName} className="mb-4">
              {/* Role Header */}
              <div className="px-4 py-1">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
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
