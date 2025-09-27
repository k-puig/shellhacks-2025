import { Hono } from "hono"
const actions = new Hono()


actions.post("actions/message/:id", (c) => {
    //todo: pass service function to send a message to user id
})

actions.delete("actions/message/delete/:id", (c) => {
    //todo: pass service function to delete a message by user id
})

actions.get("actions/message/all/:userId", (c) => {
    //todo: pass service function to fetch all messages f a user
})

actions.get("actions/:id", (c) => {
    //todo: pass service function to fetch user data by id
})

actions.get("actions/userChannels/:id", (c) => {
    //todo: pass service function to fetch all channels the id is part of
})



export default actions