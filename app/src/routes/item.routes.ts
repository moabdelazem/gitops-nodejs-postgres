import { Router } from "express";
import {
  createItemHandler,
  deleteItemHandler,
  getItemByIdHandler,
  listItemsHandler,
  updateItemHandler,
} from "../handlers/item.handler";

const router = Router();

router.get("/", listItemsHandler);
router.get("/:id", getItemByIdHandler);
router.post("/", createItemHandler);
router.patch("/:id", updateItemHandler);
router.delete("/:id", deleteItemHandler);

export default router;
