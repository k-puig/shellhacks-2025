export interface Instance {
  id: string;
  name: string;
  icon?: string;
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
  topic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  nickname?: string;
  bio?: string;
  picture?: string;
  banner?: string;
  hashPassword: string; // Won't be sent to client
  admin: boolean;
  status: "online" | "away" | "busy" | "offline";
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  color?: string;
  permissions: string; // JSON string of permissions
  instanceId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  user?: User;
  channel?: Channel;
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
