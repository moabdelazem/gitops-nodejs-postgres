import { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import {
  createItem as createItemRecord,
  deleteItem as deleteItemRecord,
  getItemById,
  listItems,
  updateItem as updateItemRecord,
} from "../controllers/item.controller";
import {
  createItemSchema,
  itemIdSchema,
  updateItemSchema,
} from "../schemas/item.schema";

export async function listItemsHandler(_req: Request, res: Response) {
  const items = await listItems();
  res.json(items);
}

export async function getItemByIdHandler(req: Request, res: Response) {
  const { id } = itemIdSchema.parse(req.params);
  const item = await getItemById(id);

  if (!item) {
    throw AppError.notFound("Item not found");
  }

  res.json(item);
}

export async function createItemHandler(req: Request, res: Response) {
  const payload = createItemSchema.parse(req.body);
  const item = await createItemRecord(payload);
  res.status(201).json(item);
}

export async function updateItemHandler(req: Request, res: Response) {
  const { id } = itemIdSchema.parse(req.params);
  const payload = updateItemSchema.parse(req.body);
  const item = await updateItemRecord(id, payload);

  if (!item) {
    throw AppError.notFound("Item not found");
  }

  res.json(item);
}

export async function deleteItemHandler(req: Request, res: Response) {
  const { id } = itemIdSchema.parse(req.params);
  const deleted = await deleteItemRecord(id);

  if (!deleted) {
    throw AppError.notFound("Item not found");
  }

  res.status(204).send();
}
