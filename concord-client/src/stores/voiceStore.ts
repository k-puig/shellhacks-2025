import { create } from "zustand";
import { Socket } from "socket.io-client";

// --- TYPE DEFINITIONS ---

interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

// The state managed by the store
interface VoiceState {
  socket: Socket | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  peerConnections: Map<string, RTCPeerConnection>;
  iceServers: IceServerConfig[];
  isConnected: boolean;
  isConnecting: boolean;
  activeVoiceChannelId: string | null;
  isDeafened: boolean;
  isMuted: boolean;
}

// Actions that can be performed on the store
interface VoiceActions {
  init: (socket: Socket) => void;
  joinChannel: (
    channelId: string,
    userId: string,
    token: string,
  ) => Promise<void>;
  leaveChannel: () => void;
  cleanup: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
}

// --- ZUSTAND STORE IMPLEMENTATION ---

export const useVoiceStore = create<VoiceState & VoiceActions>((set, get) => {
  // --- INTERNAL HELPERS (not exposed in the store's public interface) ---

  /**
   * Safely closes and removes a single peer connection.
   * @param userId The ID of the user whose connection to clean up.
   */
  const cleanupPeerConnection = (userId: string) => {
    const { peerConnections } = get();
    const peerConnection = peerConnections.get(userId);

    if (peerConnection) {
      peerConnection.close();
      peerConnections.delete(userId);
    }

    set((state) => {
      const newStreams = new Map(state.remoteStreams);
      newStreams.delete(userId);
      return {
        remoteStreams: newStreams,
        peerConnections: new Map(peerConnections),
      };
    });
  };

  /**
   * Creates a new RTCPeerConnection for a target user and configures it.
   * @param targetUserId The user to connect to.
   * @returns The configured RTCPeerConnection instance.
   */
  const createPeerConnection = (targetUserId: string): RTCPeerConnection => {
    console.log(`Creating peer connection for: ${targetUserId}`);
    const { iceServers, localStream, socket, peerConnections } = get();

    const peerConnection = new RTCPeerConnection({ iceServers });

    // Add local stream tracks to the new connection
    if (localStream) {
      localStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localStream));
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("webrtc-ice-candidate", {
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    // Handle incoming remote tracks
    peerConnection.ontrack = (event) => {
      console.log(`Received remote track from: ${targetUserId}`);
      set((state) => {
        const newStreams = new Map(state.remoteStreams);
        newStreams.set(targetUserId, event.streams[0]);
        return { remoteStreams: newStreams };
      });
    };

    // For debugging connection state
    peerConnection.onconnectionstatechange = () => {
      console.log(
        `Connection state change for ${targetUserId}: ${peerConnection.connectionState}`,
      );
      if (
        peerConnection.connectionState === "disconnected" ||
        peerConnection.connectionState === "failed"
      ) {
        cleanupPeerConnection(targetUserId);
      }
    };

    peerConnections.set(targetUserId, peerConnection);
    set({ peerConnections: new Map(peerConnections) });
    return peerConnection;
  };

  // --- SOCKET EVENT HANDLERS ---
  // These are defined once and can be reused by the join/leave actions.

  const onJoinedVoiceChannel = async (data: {
    connectedUserIds: string[];
    iceServers: IceServerConfig[];
  }) => {
    console.log(
      "Successfully joined voice channel. Users:",
      data.connectedUserIds,
    );
    set({
      iceServers: data.iceServers,
      isConnecting: false,
      isConnected: true,
    });

    for (const userId of data.connectedUserIds) {
      const peerConnection = createPeerConnection(userId);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      get().socket?.emit("webrtc-offer", {
        targetUserId: userId,
        sdp: peerConnection.localDescription,
      });
    }
  };

  const onUserLeft = (data: { userId: string }) => {
    console.log(`User ${data.userId} left the channel.`);
    cleanupPeerConnection(data.userId);
  };

  const onWebRTCOffer = async (data: {
    senderUserId: string;
    sdp: RTCSessionDescriptionInit;
  }) => {
    console.log("Received WebRTC offer from:", data.senderUserId);
    const peerConnection = createPeerConnection(data.senderUserId);
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.sdp),
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    get().socket?.emit("webrtc-answer", {
      targetUserId: data.senderUserId,
      sdp: peerConnection.localDescription,
    });
  };

  const onWebRTCAnswer = async (data: {
    senderUserId: string;
    sdp: RTCSessionDescriptionInit;
  }) => {
    console.log("Received WebRTC answer from:", data.senderUserId);
    const peerConnection = get().peerConnections.get(data.senderUserId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.sdp),
      );
    }
  };

  const onICECandidate = async (data: {
    senderUserId: string;
    candidate: RTCIceCandidateInit;
  }) => {
    const peerConnection = get().peerConnections.get(data.senderUserId);
    if (peerConnection && data.candidate) {
      try {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(data.candidate),
        );
      } catch (e) {
        console.error("Error adding received ICE candidate", e);
      }
    }
  };

  const onError = (error: { message: string }) => {
    console.error("Voice channel error:", error.message);
    get().leaveChannel(); // Disconnect on error
  };

  // --- STORE DEFINITION (STATE & ACTIONS) ---
  return {
    // Initial State
    socket: null,
    localStream: null,
    remoteStreams: new Map(),
    peerConnections: new Map(),
    iceServers: [],
    isConnected: false,
    isConnecting: false,
    activeVoiceChannelId: null,
    isMuted: false,
    isDeafened: false,

    // Actions
    init: (socketInstance) => {
      set({ socket: socketInstance });
    },

    joinChannel: async (channelId: string, userId: string, token: string) => {
      const { socket, activeVoiceChannelId, leaveChannel, isConnecting } =
        get();
      if (!socket || isConnecting || activeVoiceChannelId === channelId) return;
      if (!userId || !token) {
        console.error("Join channel requires user and token.");
        return;
      }

      if (activeVoiceChannelId) {
        leaveChannel();
      }

      set({ isConnecting: true, activeVoiceChannelId: channelId });

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        set({ localStream: stream });
      } catch (error) {
        console.error("Could not get user media:", error);
        set({ isConnecting: false, activeVoiceChannelId: null });
        return;
      }

      // Attach all necessary listeners for a voice session
      socket.on("joined-voicechannel", onJoinedVoiceChannel);
      socket.on("user-left-voicechannel", onUserLeft);
      socket.on("webrtc-offer", onWebRTCOffer);
      socket.on("webrtc-answer", onWebRTCAnswer);
      socket.on("webrtc-ice-candidate", onICECandidate);
      socket.on("error-voicechannel", onError);

      // *** THE FIX: Send user credentials with the join request ***
      socket.emit("join-voicechannel", {
        userId: userId,
        userToken: token,
        voiceChannelId: channelId,
      });
    },
    leaveChannel: () => {
      const { socket, peerConnections, localStream, activeVoiceChannelId } =
        get();
      if (!socket || !activeVoiceChannelId) return;

      console.log(`Leaving voice channel: ${activeVoiceChannelId}`);
      socket.emit("leave-voicechannel", { channelId: activeVoiceChannelId });

      // Clean up all event listeners
      socket.off("joined-voicechannel");
      socket.off("user-left-voicechannel");
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice-candidate");
      socket.off("error-voicechannel");

      // Close all peer connections
      peerConnections.forEach((pc) => pc.close());

      // Stop local media tracks
      localStream?.getTracks().forEach((track) => track.stop());

      // Reset state to initial values
      set({
        localStream: null,
        remoteStreams: new Map(),
        peerConnections: new Map(),
        isConnected: false,
        isConnecting: false,
        activeVoiceChannelId: null,
        iceServers: [],
      });
    },

    toggleMute: () => {
      set((state) => {
        const newMutedState = !state.isMuted;
        if (state.localStream) {
          state.localStream.getAudioTracks().forEach((track) => {
            track.enabled = !newMutedState;
          });
        }
        // Cannot be deafened and unmuted
        if (state.isDeafened && !newMutedState) {
          return { isMuted: newMutedState, isDeafened: false };
        }
        return { isMuted: newMutedState };
      });
    },

    toggleDeafen: () => {
      set((state) => {
        const newDeafenedState = !state.isDeafened;
        // When deafening, you are also muted
        if (newDeafenedState && !state.isMuted) {
          // Manually mute logic without toggling deafen state again
          if (state.localStream) {
            state.localStream.getAudioTracks().forEach((track) => {
              track.enabled = false;
            });
          }
          return { isDeafened: newDeafenedState, isMuted: true };
        }
        return { isDeafened: newDeafenedState };
      });
    },

    cleanup: () => {
      get().leaveChannel();
      set({ socket: null });
    },
  };
});
