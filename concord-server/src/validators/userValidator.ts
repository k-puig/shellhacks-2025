import { z } from 'zod'

export const queryUserByIdSchema = z.object({
  id: z.uuidv7()
})

export const queryAllUsersByInstanceId = z.object({
  instanceId: z.uuidv7()
})

export const createUserSchema = z.object({
  username: z.string().min(3).max(30),
  nickname: z.string().min(1).max(30).optional(),
  bio: z.string().max(500).optional(),
  picture: z.url().optional(),
  banner: z.url().optional(),
  status: z.enum(['online', 'offline', 'dnd', 'idle', 'invis']).default('online'),
  admin: z.boolean().default(false),
})

export type QueryUserByIdInput = z.infer<typeof queryUserByIdSchema>
export type QueryAllUsersByInstanceIdInput = z.infer<typeof queryAllUsersByInstanceId>
export type CreateUserInput = z.infer<typeof createUserSchema>