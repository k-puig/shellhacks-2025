import { z } from 'zod';

export const createInstanceRequestSchema = z.object({
    name: z.string().min(1, 'Instance name cannot be empty'),
    icon: z.url().optional(),
    requestingUserId: z.uuidv7(),
    requestingUserToken: z.string()
});

export const getAllInstancesResponseSchema = z.object({
    success: z.boolean(),
    data: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            icon: z.string().nullable(),
            createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date string format"
    }),
            updatedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date string format"
    })
        })
    ).optional(),
    error: z.string().optional()
});

export type CreateInstanceRequest = z.infer<typeof createInstanceRequestSchema>;
export type GetAllInstancesResponse = z.infer<typeof getAllInstancesResponseSchema>;