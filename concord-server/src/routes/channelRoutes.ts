import {
    createNewChannel,
    fetchChannelData,
    fetchChannelsByCategory,
    updateExistingChannel,
    deleteExistingChannel,
    deleteAllChannelsByCategory,
} from "../controller/channelController";

import {
    createChannelSchema,
    getChannelSchema,
    getChannelsByCategoryIdSchema,
    updateChannelSchema,
    deleteChannelSchema,
    deleteChannelsByCategoryIdSchema,

    CreateChannelInput,
    GetChannelInput,
    GetChannelsByCategoryIdInput,
    UpdateChannelInput,
    DeleteChannelInput,
    DeleteChannelsByCategoryIdInput,
} from "../validators/channelValidator";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";

const channelRoutes = new Hono()

// Create a new channel
channelRoutes.post(
    "/",
    describeRoute({
        description: "Create a new channel",
        responses: {
            200: {
                description: "Success creating channel",
                content: {
                    "application/json": { schema: resolver(createChannelSchema) },
                },
            },
            400: {
                description: "Bad Request - Invalid input data",
                content: {
                    "application/json": { schema: resolver(createChannelSchema)},
                },
            },
            401: {
                description: "Unauthorized - Admin access required",
                content: {
                    "application/json": { schema: resolver(createChannelSchema)},
                },
            },
            404: {
                description: "User Id not found",
                content: { 
                    "application/json": { schema: resolver(createChannelSchema)},
                },
            },
        },
    }),
    zValidator("json", createChannelSchema),
    async (c) => {
        const data = c.req.valid("json") as CreateChannelInput;
        const channelData = await createNewChannel(data);
        if (channelData) {
            return c.json(channelData);
        } else {
            return c.json({ error: "Failed to create channel" }, 400);
        }
    }
)

// Get a channel by ID
channelRoutes.get(
    "/:id",
    describeRoute({
        description: "Get channel by id",
        responses: {
            200: {
                description: "Success getting channel",
                content: {
                    "application/json": { schema: resolver(getChannelSchema) },
                },
            },
            404: {
                description: "Channel id not found",
                content: {
                    "application/json": { schema: resolver(getChannelSchema) },
                },
            },
        },
    }),
    async (c) => {
        const id = c.req.param("id");
        const channelData = await fetchChannelData(id);
        if (channelData) {
            return c.json(channelData);
        } else {
            return c.json({ error: "Channel not found" }, 404);
        }
    }
);

// Get all channels by category ID
channelRoutes.get(
    "/category/:categoryId",
    describeRoute({
        description: "Get all channels by category id",
        responses: {
            200: {
                description: "Success getting all channels in category",
                content: {
                    "application/json": { schema: resolver(getChannelsByCategoryIdSchema) },
                },
            },
            400: {
                description: "Bad Request - Missing category ID",
                content: {
                    "application/json": { schema: resolver(getChannelsByCategoryIdSchema) },
                },
            },
        },
    }),
    async (c) => {
        const categoryId = c.req.param("categoryId");
        if (!categoryId) {
            return c.json({ error: "No category id provided" }, 400);
        }
        
        const channels = await fetchChannelsByCategory(categoryId);
        if (channels) {
            return c.json(channels);
        } else {
            return c.json({ error: "Error getting channels from category" }, 500);
        }
    }
);

// Update a channel
channelRoutes.put(
    "/:id",
    describeRoute({
        description: "Update an existing channel",
        responses: {
            200: {
                description: "Success updating channel",
                content: {
                    "application/json": { schema: resolver(updateChannelSchema) },
                },
            },
            400: {
                description: "Bad Request - Invalid input data",
                content: {
                    "application/json": { schema: resolver(updateChannelSchema)},
                },
            },
            401: {
                description: "Unauthorized - Admin access required",
                content: {
                    "application/json": { schema: resolver(updateChannelSchema)},
                },
            },
            404: {
                description: "Channel id or User Id not found",
                content: { 
                    "application/json": { schema: resolver(updateChannelSchema)},
                },
            },
        },
    }),
    zValidator("json", updateChannelSchema),
    async (c) => {
        const id = c.req.param("id");
        const data = c.req.valid("json") as UpdateChannelInput;
        
        // Ensure the ID in the path matches the one in the body
        if (data.id && data.id !== id) {
            return c.json({ error: "ID in path does not match ID in body" }, 400);
        }
        
        // Set ID from path if not in body
        if (!data.id) {
            data.id = id;
        }
        
        const result = await updateExistingChannel(data);
        if (result) {
            return c.json(result);
        } else {
            return c.json({ error: "Failed to update channel" }, 400);
        }
    }
);

// Delete a specific channel
channelRoutes.delete(
    "/:id",
    describeRoute({
        description: "Delete an existing channel",
        responses: {
            200: {
                description: "Success deleting channel",
                content: {
                    "application/json": { schema: resolver(deleteChannelSchema) },
                },
            },
            400: {
                description: "Bad Request - Invalid input data",
                content: {
                    "application/json": { schema: resolver(deleteChannelSchema)},
                },
            },
            401: {
                description: "Unauthorized - Admin access required",
                content: {
                    "application/json": { schema: resolver(deleteChannelSchema)},
                },
            },
            404: {
                description: "Channel id or User Id not found",
                content: { 
                    "application/json": { schema: resolver(deleteChannelSchema)},
                },
            },
        },
    }),
    zValidator("json", deleteChannelSchema),
    async (c) => {
        const id = c.req.param("id");
        const data = c.req.valid("json") as DeleteChannelInput;
        
        // Ensure the ID in the path matches the one in the body
        if (data.id !== id) {
            return c.json({ error: "ID in path does not match ID in body" }, 400);
        }
        
        const result = await deleteExistingChannel(data);
        if (result) {
            return c.json({ success: true });
        } else {
            return c.json({ error: "Failed to delete channel" }, 400);
        }
    }
);

// Delete all channels by category ID
channelRoutes.delete(
    "/category/:categoryId",
    describeRoute({
        description: "Delete all channels by category id",
        responses: {
            200: {
                description: "Success deleting all channels in category",
                content: {
                    "application/json": { schema: resolver(deleteChannelsByCategoryIdSchema) },
                },
            },
            400: {
                description: "Bad Request - Invalid input data",
                content: {
                    "application/json": { schema: resolver(deleteChannelsByCategoryIdSchema)},
                },
            },
            401: {
                description: "Unauthorized - Admin access required",
                content: {
                    "application/json": { schema: resolver(deleteChannelsByCategoryIdSchema)},
                },
            },
            404: {
                description: "Category id or User Id not found",
                content: { 
                    "application/json": { schema: resolver(deleteChannelsByCategoryIdSchema)},
                },
            },
        },
    }),
    zValidator("json", deleteChannelsByCategoryIdSchema),
    async (c) => {
        const categoryId = c.req.param("categoryId");
        const data = c.req.valid("json") as DeleteChannelsByCategoryIdInput;
        
        // Ensure the categoryId in the path matches the one in the body
        if (data.categoryId !== categoryId) {
            return c.json({ error: "Category ID in path does not match Category ID in body" }, 400);
        }
        
        const result = await deleteAllChannelsByCategory(data);
        if (result) {
            return c.json({ success: true });
        } else {
            return c.json({ error: "Failed to delete channels" }, 400);
        }
    }
)

export { channelRoutes };