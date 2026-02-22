import { z } from "zod";

export const itemIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createItemSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(2000).optional(),
});

export const updateItemSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(2000).optional(),
})
  .refine((value) => value.name !== undefined || value.description !== undefined, {
    message: "At least one field is required",
  });

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
