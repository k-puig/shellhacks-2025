export interface Instance {
  id: string;
  name: string;
  icon?: string | null;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  instanceId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
  categoryId: string;
  instanceId: string;
  position: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = "online" | "away" | "busy" | "offline";
export interface User {
  id: string;
  username: string;
  nickname?: string | null;
  bio?: string | null;
  picture?: string | null;
  banner?: string | null;
  hashPassword: string;
  admin: boolean;
  status: "online" | "away" | "busy" | "offline";
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}

export interface Role {
  instanceId: string;
  role: "admin" | "mod" | "member";
}

export interface Message {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
  isGrouped?: boolean | null;
  replyTo?: Message | null;
  // Relations
  user?: User;
  channel?: Channel;

  replyToId?: string | null;
}

// Direct messages
// export interface DirectMessage {
//   id: string;
//   content: string;
//   senderId: string;
//   receiverId: string;
//   edited: boolean;
//   createdAt: string;
//   updatedAt: string;
//   // Relations
//   sender?: User;
//   receiver?: User;
// }

export interface UserRole {
  userId: string;
  roleId: string;
  instanceId: string;
}

export interface UserInstance {
  userId: string;
  instanceId: string;
  joinedAt: string;
}
