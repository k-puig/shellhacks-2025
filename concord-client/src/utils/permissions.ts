import { User, Role } from "@/types/database";

export type UserPermission =
  | "view_instance"
  | "create_channel"
  | "delete_channel"
  | "create_category"
  | "delete_category"
  | "manage_instance"
  | "delete_messages"
  | "pin_messages"
  | "manage_users"
  | "create_instance"
  | "manage_roles";

export type UserRole = "admin" | "mod" | "member";

// Check if user has a specific role in an instance
export function hasInstanceRole(
  user: User | null,
  instanceId: string,
  role: UserRole,
): boolean {
  if (!user) return false;

  // Global admins have all permissions
  if (user.admin) return true;

  const userRole = user.roles.find((r) => r.instanceId === instanceId);
  if (!userRole) return false;

  switch (role) {
    case "admin":
      return userRole.role === "admin";
    case "mod":
      return userRole.role === "admin" || userRole.role === "mod";
    case "member":
      return (
        userRole.role === "admin" ||
        userRole.role === "mod" ||
        userRole.role === "member"
      );
    default:
      return false;
  }
}

// Check if user has access to view an instance
export function canViewInstance(
  user: User | null,
  instanceId: string,
): boolean {
  if (!user) return false;

  // Global admins can view all instances
  if (user.admin) return true;

  // Check if user has any role in this instance
  return user.roles.some((role) => role.instanceId === instanceId);
}

// Check if user has a specific permission in an instance
export function hasPermission(
  user: User | null,
  instanceId: string,
  permission: UserPermission,
): boolean {
  if (!user) return false;

  // Global admins have all permissions everywhere
  if (user.admin) return true;

  const userRole = user.roles.find((r) => r.instanceId === instanceId);
  if (!userRole) return false;

  switch (permission) {
    case "view_instance":
      return hasInstanceRole(user, instanceId, "member");

    case "create_channel":
    case "delete_channel":
    case "create_category":
    case "delete_category":
    case "manage_instance":
    case "manage_users":
    case "manage_roles":
      return hasInstanceRole(user, instanceId, "admin");

    case "delete_messages":
    case "pin_messages":
      return hasInstanceRole(user, instanceId, "mod");

    case "create_instance":
      return user.admin; // Only global admins can create instances

    default:
      return false;
  }
}

// Get user's role in a specific instance
export function getUserRole(
  user: User | null,
  instanceId: string,
): UserRole | null {
  if (!user) return null;

  // Global admins are always admins
  if (user.admin) return "admin";

  const userRole = user.roles.find((r) => r.instanceId === instanceId);
  return userRole ? (userRole.role as UserRole) : null;
}

// Filter instances that user can access
export function getAccessibleInstances(
  user: User | null,
  instances: any[],
): any[] {
  if (!user) return [];

  // Global admins can see all instances
  if (user.admin) return instances;

  // Filter instances where user has a role
  const userInstanceIds = new Set(user.roles.map((role) => role.instanceId));
  return instances.filter((instance) => userInstanceIds.has(instance.id));
}

// Check if user can delete a specific message
export function canDeleteMessage(
  user: User | null,
  instanceId: string,
  messageUserId: string,
): boolean {
  if (!user) return false;

  // Users can always delete their own messages
  if (user.id === messageUserId) return true;

  // Mods and admins can delete any message
  return hasPermission(user, instanceId, "delete_messages");
}

// Check if user can edit a specific message
export function canEditMessage(
  user: User | null,
  messageUserId: string,
): boolean {
  if (!user) return false;

  // Users can only edit their own messages
  return user.id === messageUserId;
}

// Check if user can pin messages
export function canPinMessage(user: User | null, instanceId: string): boolean {
  return hasPermission(user, instanceId, "pin_messages");
}

// Check if user is global admin
export function isGlobalAdmin(user: User | null): boolean {
  return user?.admin === true;
}

// Helper to get role display info
export function getRoleDisplayInfo(role: UserRole) {
  switch (role) {
    case "admin":
      return {
        name: "Admin",
        color: "#ff6b6b",
        priority: 3,
        description: "Full server permissions",
      };
    case "mod":
      return {
        name: "Moderator",
        color: "#4ecdc4",
        priority: 2,
        description: "Can moderate messages and users",
      };
    case "member":
      return {
        name: "Member",
        color: null,
        priority: 1,
        description: "Basic server access",
      };
    default:
      return {
        name: "Unknown",
        color: null,
        priority: 0,
        description: "Unknown role",
      };
  }
}
