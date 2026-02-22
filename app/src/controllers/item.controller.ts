import { query } from "../database/db";
import { CreateItemInput, UpdateItemInput } from "../schemas/item.schema";

export interface Item {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export async function listItems(): Promise<Item[]> {
  const result = await query("SELECT * FROM items ORDER BY id ASC");
  return result.rows as Item[];
}

export async function getItemById(id: number): Promise<Item | null> {
  const result = await query("SELECT * FROM items WHERE id = $1", [id]);
  return (result.rows[0] as Item | undefined) ?? null;
}

export async function createItem(payload: CreateItemInput): Promise<Item> {
  const result = await query(
    `
      INSERT INTO items (name, description)
      VALUES ($1, $2)
      RETURNING *
    `,
    [payload.name, payload.description ?? null],
  );

  return result.rows[0] as Item;
}

export async function updateItem(
  id: number,
  payload: UpdateItemInput,
): Promise<Item | null> {
  const existing = await getItemById(id);
  if (!existing) {
    return null;
  }

  const nextName = payload.name ?? existing.name;
  const nextDescription = payload.description ?? existing.description;

  const result = await query(
    `
      UPDATE items
      SET name = $2,
          description = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
    [id, nextName, nextDescription],
  );

  return result.rows[0] as Item;
}

export async function deleteItem(id: number): Promise<boolean> {
  const result = await query("DELETE FROM items WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
