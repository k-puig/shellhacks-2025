import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  // Sidebar states
  showMemberList: boolean;
  sidebarCollapsed: boolean;

  // Responsive
  isMobile: boolean;
  screenWidth: number;

  // Theme
  theme: "dark" | "light";

  // Modal states
  showUserSettings: boolean;
  showServerSettings: boolean;
  showCreateChannel: boolean;
  showCreateServer: boolean;
  showInviteModal: boolean;

  // Chat states
  // isTyping: boolean;
  // typingUsers: string[];

  // Navigation
  activeChannelId: string | null;
  activeInstanceId: string | null;

  // Actions
  toggleMemberList: () => void;
  toggleSidebar: () => void;
  setTheme: (theme: "dark" | "light") => void;
  setScreenWidth: (width: number) => void;
  updateIsMobile: () => void;

  // Modal actions
  openUserSettings: () => void;
  closeUserSettings: () => void;
  openServerSettings: () => void;
  closeServerSettings: () => void;
  openCreateChannel: () => void;
  closeCreateChannel: () => void;
  openCreateServer: () => void;
  closeCreateServer: () => void;
  openInviteModal: () => void;
  closeInviteModal: () => void;

  // Chat actions
  // setTyping: (isTyping: boolean) => void;
  // addTypingUser: (userId: string) => void;
  // removeTypingUser: (userId: string) => void;
  // clearTypingUsers: () => void;

  // Navigation actions
  setActiveChannel: (channelId: string | null) => void;
  setActiveInstance: (instanceId: string | null) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      // Initial state
      showMemberList: true,
      sidebarCollapsed: false,
      isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
      screenWidth: typeof window !== "undefined" ? window.innerWidth : 1024,
      theme: "dark",
      showUserSettings: false,
      showServerSettings: false,
      showCreateChannel: false,
      showCreateServer: false,
      showInviteModal: false,
      isTyping: false,
      typingUsers: [],
      activeChannelId: null,
      activeInstanceId: null,

      // Sidebar actions
      toggleMemberList: () =>
        set((state) => ({ showMemberList: !state.showMemberList })),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      setScreenWidth: (screenWidth) => set({ screenWidth }),
      updateIsMobile: () =>
        set((state) => ({
          isMobile: state.screenWidth < 768,
          // Auto-collapse sidebar on mobile
          sidebarCollapsed:
            state.screenWidth < 768 ? true : state.sidebarCollapsed,
          // Hide member list on small screens
          showMemberList:
            state.screenWidth < 1024 ? false : state.showMemberList,
        })),

      // Modal actions
      openUserSettings: () => set({ showUserSettings: true }),
      closeUserSettings: () => set({ showUserSettings: false }),
      openServerSettings: () => set({ showServerSettings: true }),
      closeServerSettings: () => set({ showServerSettings: false }),
      openCreateChannel: () => set({ showCreateChannel: true }),
      closeCreateChannel: () => set({ showCreateChannel: false }),
      openCreateServer: () => set({ showCreateServer: true }),
      closeCreateServer: () => set({ showCreateServer: false }),
      openInviteModal: () => set({ showInviteModal: true }),
      closeInviteModal: () => set({ showInviteModal: false }),

      // Chat actions
      // setTyping: (isTyping) => set({ isTyping }),
      // addTypingUser: (userId) =>
      //   set((state) => ({
      //     typingUsers: state.typingUsers.includes(userId)
      //       ? state.typingUsers
      //       : [...state.typingUsers, userId],
      //   })),
      // removeTypingUser: (userId) =>
      //   set((state) => ({
      //     typingUsers: state.typingUsers.filter((id) => id !== userId),
      //   })),
      // clearTypingUsers: () => set({ typingUsers: [] }),

      // Navigation actions
      setActiveChannel: (channelId) => set({ activeChannelId: channelId }),
      setActiveInstance: (instanceId) => set({ activeInstanceId: instanceId }),
    }),
    {
      name: "concord-ui-store",
      // Only persist UI preferences, not temporary states
      partialize: (state) => ({
        showMemberList: state.showMemberList,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    },
  ),
);
