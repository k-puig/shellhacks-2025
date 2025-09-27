import { Hono } from "hono"
import { fetchUserData } from "../controller/actions"
const actions = new Hono()

/*
actions.post("actions/message/:id", (c) => {
    //todo: pass service function to send a message to user id
})

actions.delete("actions/message/delete/:id", (c) => {
    //todo: pass service function to delete a message by user id
})

actions.get("actions/message/all/:userId", (c) => {
    //todo: pass service function to fetch all messages f a user
})



actions.get("actions/userChannels/:id", (c) => {
    //todo: pass service function to fetch all channels the id is part of
})
*/

actions.get("actions/:id", async (c) => {
    const id = c.req.param("id");
    const userData = await fetchUserData(id);
    if (userData) {
        return c.json(userData);
    } else {
        return c.json({ error: "User not found" }, 404);
    }
})


export default actions