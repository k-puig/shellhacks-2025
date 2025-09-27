import { Context } from "hono";
import { sendMessageToChannel, removeMessageFromChannel } from "../services/realtime.js"
import { success } from "zod";



export async function postMessageToChannel(
    io: any,
    c: Context
) {
    try {
        io = c.get("io");

        const instanceId = c.req.param("instanceId");
        const categoryId = c.req.param("categoryId");
        const channelId = c.req.param("channelId");
        const message = await c.req.json();
        
        const result = await sendMessageToChannel(
            instanceId,
            categoryId,
            channelId,
            message,
            "new_channel_message",
            io
        )

        if(result === "Event not implemented"){
            console.log("controller::realtime::postMessageToChannel - Failed to send message")
            return c.json({
                success: false,
                message: "Event not implemented or recognized",
                status: 400
            })
        }

        if(result === "no acknowledgment"){
            console.log("controller::realtime::postMessageToChannel - No acknowledgment received from client")
            return c.json({
                success: false,
                message: "No acknowledgment received from client",
                status: 500
            })
        }

        if(!result){
            throw new Error("failed to send message");
        }

        return c.json({
            success: true,
            message: "Message sent successfully",
            status: 200
        })
        
        
    } catch (err) {
        const errMessage = err as Error;
        console.log("controller::realtime::postMessageToChannel - ", errMessage);
        return c.json({
            success: false,
            message: errMessage.message,
            status: 500
        });
    }
}

export async function deleteMessageFromChannel(
    io: any,
    c: Context
){
    try {

        io = c.get("io");

        const instanceId = c.req.param("instanceId");
        const categoryId = c.req.param("categoryId");
        const channelId = c.req.param("channelId");
        const messageId = c.req.param("messageId");

        const result = await removeMessageFromChannel(
            instanceId,
            categoryId,
            channelId,
            messageId,
            "delete_channel_message",
            io
        )

        if(result === "event not implemented"){
            console.log("controller::realtime::deleteMessageFromChannel - Event not implemented")
            return c.json({
                success: false,
                message: "Event not implemented or recognized",
                status: 400
            });
        }

        if(result === "no acknowledgment"){
            console.log("controller::realtime::deleteMessageFromChannel - No acknowledgment received from client")
            return c.json({
                success: false,
                message: "No acknowledgment received from client",
                status: 500
            });
        }

        if(!result){
            throw new Error("failed to delete message");
        }

        c.json({
            success: true,
            message: "Message deleted successfully",
            status: 200
        })
        
    } catch (err) {

        const errMessage = err as Error;
        console.log("services::realtime::deleteMessageFromChannel - ", errMessage);
        return c.json({
            success: false,
            message: errMessage.message,
            status: 500
        });
    }
}