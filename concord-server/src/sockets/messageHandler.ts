import { Server, Socket } from "socket.io";
import { getUserCredentials, getUserInformation } from "../services/userService";
import { getAllInstances, getInstanceByChannelId, getInstancesByUserId } from "../services/instanceService";
import { getCategoriesByInstance, getCategory, getChannel } from "../services/channelService";
import { sendMessageToChannel } from "../services/messageService";



const messagesChannelMembers = new Map<string, Map<string, Socket>>();

export function registerMessageHandlers(io: Server) {
    io.on("connection", (socket: Socket) => {
        console.log("Message handler connected")

        socket.on("join-channel", (data) => {
            const payload = data as {
                userId: string,
                channelId: string,
            }

            if (!payload) {
                socket.emit("error-channel", "no payload in message conn")
                return;
            }
            
            // Initialize map for channel if not present
            if (!messagesChannelMembers.has(payload.channelId)) {
                messagesChannelMembers.set(payload.channelId, new Map());
            }
            const channelMembers = messagesChannelMembers.get(payload.channelId)!;

            // Remove user if already present in this channel
            if (channelMembers.has(payload.userId)){
                channelMembers.delete(payload.userId);
            }

            // add to map
            channelMembers.set(payload.userId, socket);

            socket.join(payload.channelId);
            socket.emit("joined-channel", { 
                channelId: payload.channelId,
                connectedUserIds: Array.from(channelMembers.keys()).filter(e => e !== payload.userId)
            });
            console.log(`user id ${data.userId} from socket ${socket.id} joined channel ${data.channelId}`);
        })

        socket.on("send-message", async (data) => {
            console.log("message received in handler", data)

            const payload = data as {
                channelId: string,
                userId: string,
                content: string,
                token: string,
                repliedMessageId?: string | null,
                userName?: string,
                userPFP?: string,
            } | undefined;

            if (!payload || !payload.channelId || !payload.userId || !payload.content || !payload.token) {
                const errMsg = "invalid payload for send-message";
                socket.emit("error-channel", errMsg);
                return;
            }

            // Persist message via service (service validates token)
            const saved = await sendMessageToChannel(
                payload.channelId,
                payload.userId,
                payload.content,
                payload.token,
                payload.repliedMessageId ?? null,
            );

            if (!saved) {
                const errMsg = "failed to save message";
                socket.emit("error-channel", errMsg);
                return;
            }

            // Emit only to sockets tracked for this channel (do not rely on rooms)
            const channelMembers = messagesChannelMembers.get(payload.channelId);
            if (channelMembers && channelMembers.size > 0) {
                for (const sock of Array.from(channelMembers.values())) {
                    try {
                        sock.emit("receive-message", {
                            message: saved,
                            userName: payload.userName,
                            userPFP: payload.userPFP,
                        });
                    } catch (e) {
                    }
                }
            } else {
                // Fallback: no tracked sockets for channel, still emit via io to be safe
                io.to(payload.channelId).emit("receive-message", {
                    message: saved,
                    userName: payload.userName,
                    userPFP: payload.userPFP,
                });
            }
        })

        socket.on("delete-message", async (data) => {
            const payload = data as {
                userId: string,
                channelId: string,
                messageId: string,
                userToken?: string,
            }
            if (!payload) {
                socket.emit("error-channel", "no payload in delete message")
                return;
            }

            //check if user is within the channel
            const channelMembers = messagesChannelMembers.get(payload.channelId);
            if (!channelMembers || !channelMembers.has(payload.userId)) {
                socket.emit("error-channel", "user is not in channel")
                return;
            }

            //authenticate user
            const userCreds = await getUserCredentials(payload.userId);
            if (!userCreds || !userCreds.token || userCreds.token != payload.userToken) {
                socket.emit("error-channel", "bad user creds in delete message");
                return;
            }

            //determine if user is authorized to delete messages
            const user = await getUserInformation(payload.userId);
            const instance = await getInstanceByChannelId(payload.channelId);
            const instances = await getAllInstances();
            if(!user || !instance || !instances || !instances.data?.find(e => e.id === instance.id)) {
                socket.emit("error-channel", "user not authorized to delete message");
                return;
            }

            const isUserAdmin = user.admin
            const hasModeratorRole = user.role.some(role => 
                role.instanceId === instance.id && 
                role.type.toLowerCase() === "moderator"
            );

            if(!isUserAdmin && !hasModeratorRole){
                socket.emit("error-channel", "user not authorized to delete message");
                return
            } 

            socket.to(data.channelId).emit("message-deleted", data.messageId)
        })

        socket.on("ping-users", (data) =>{
            const payload = data as {
                channelId: string,
                userId: string,
                message: string,
                pingType?: string,
            } | undefined;

            if (!payload || !payload.channelId || !payload.userId) {
                socket.emit("error-channel", "invalid payload for ping-users");
                return;
            }

            // Prefer server-side membership map so we only ping tracked sockets
            const channelMembers = messagesChannelMembers.get(payload.channelId);
            if (channelMembers && channelMembers.size > 0) {
                for (const [memberId, sock] of Array.from(channelMembers.entries())) {
                    if (memberId === payload.userId) continue; // don't ping sender
                    try {
                        sock.emit("pinged", {
                            message: payload.message,
                            from: payload.userId,
                            pingType: payload.pingType,
                        });
                    } catch (e) {
                        // ignore individual socket errors
                    }
                }
                return;
            }

            // Fallback: iterate sockets in the room (exclude the sender socket)
            try {
                const sockets = Array.from((io as Server).sockets.sockets.values());
                for (const sock of sockets) {
                    try {
                        // sock.rooms is a Set-like; check membership
                        if ((sock as any).rooms && (sock as any).rooms.has(payload.channelId)) {
                            if (sock.id === socket.id) continue; // exclude origin socket
                            sock.emit("pinged", {
                                message: payload.message,
                                from: payload.userId,
                                pingType: payload.pingType,
                            });
                        }
                    } catch {}
                }
            } catch (e) {
                // last resort: emit to the room (sender may also receive)
                (io as Server).to(payload.channelId).emit("pinged", { message: payload.message, from: payload.userId, pingType: payload.pingType });
            }
        })

    })
}

