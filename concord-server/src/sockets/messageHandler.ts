import { Server, Socket } from "socket.io";
import { getUserCredentials, getUserInformation } from "../services/userService";
import { getAllInstances, getInstanceByChannelId, getInstancesByUserId } from "../services/instanceService";
import { getCategoriesByInstance, getCategory, getChannel } from "../services/channelService";



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

        socket.on("send-message", (data) => {
            console.log("message received in handler", data)
            socket.to(data.channelId).emit("receive-message", {userName: data.userName, message: data.context, userPFP: data.userPFP})
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
            socket.to(data.channelId).emit("pinged", {message: data.message})
        })

    })
}

