import { z } from "zod";

//category validators

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  position: z.number().min(0),
  instanceId: z.uuidv7().optional(),
  admin: z.boolean(),
  requestingUserId: z.uuidv7(),
  requestingUserToken: z.uuidv4(),
});

export const getCategorySchema = z.object({
  id: z.uuidv7(),
});

export const getCategoriesByInstanceIdSchema = z.object({
  instanceId: z.uuidv7(),
});

export const updateCategorySchema = z.object({
  id: z.uuidv7(),
  name: z.string().min(1).max(50).optional(),
  position: z.number().min(0).optional(),
  channels: z
    .array(
      z.object({
        id: z.string(),
      }),
    )
    .optional(),
  admin: z.boolean(),
  requestingUserId: z.uuidv7(),
  requestingUserToken: z.uuidv4(),
});

export const deleteCategorySchema = z.object({
  id: z.uuidv7(),
  admin: z.boolean(),
  requestingUserId: z.uuidv7(),
  requestingUserToken: z.uuidv4(),
});

export const deleteCategoriesByInstanceIdSchema = z.object({
  instanceId: z.uuidv7(),
  admin: z.boolean(),
  requestingUserId: z.uuidv7(),
  requestingUserToken: z.uuidv4(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type GetCategoryInput = z.infer<typeof getCategorySchema>;
export type GetCategoriesByInstanceIdInput = z.infer<
  typeof getCategoriesByInstanceIdSchema
>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
export type DeleteCategoriesByInstanceIdInput = z.infer<
  typeof deleteCategoriesByInstanceIdSchema
>;
