import { Router } from "express";
import {
  createReservation,
  deleteReservation,
  getHostReservations,
  getUserReservations,
} from "../controllers/reservationController.js";
import { protect, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(protect);
router.post("/", asyncHandler(createReservation));
router.get("/user", asyncHandler(getUserReservations));
router.get("/host", requireRole("host", "admin"), asyncHandler(getHostReservations));
router.delete("/:id", asyncHandler(deleteReservation));

export default router;
