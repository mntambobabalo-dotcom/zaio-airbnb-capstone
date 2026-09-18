import { Router } from "express";
import {
  createAccommodation,
  deleteAccommodation,
  getAccommodation,
  getHostAccommodations,
  listAccommodations,
  updateAccommodation,
} from "../controllers/accommodationController.js";
import { protect, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listAccommodations));
router.get("/host/mine", protect, requireRole("host", "admin"), asyncHandler(getHostAccommodations));
router.get("/:id", asyncHandler(getAccommodation));
router.post("/", protect, requireRole("host", "admin"), asyncHandler(createAccommodation));
router.put("/:id", protect, requireRole("host", "admin"), asyncHandler(updateAccommodation));
router.patch("/:id", protect, requireRole("host", "admin"), asyncHandler(updateAccommodation));
router.delete("/:id", protect, requireRole("host", "admin"), asyncHandler(deleteAccommodation));

export default router;
