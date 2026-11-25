import { Router } from "express";
import mongoose from "mongoose";
import {
  createItinerary,
  deleteItinerary,
  exportItineraryPdf,
  getItinerary,
  listItineraries,
  updateItinerary
} from "../controllers/itineraryController";
import { authMiddleware } from "../middleware/authMiddleware";
import { AppError } from "../middleware/errorHandler";
import { validateBody } from "../middleware/validateBody";
import {
  createItinerarySchema,
  updateItinerarySchema
} from "../schemas/itinerarySchemas";

const router = Router();

router.use(authMiddleware);

router.param("id", (req, _res, next, id: string) => {
  if (!mongoose.isValidObjectId(id)) {
    next(new AppError(400, "Invalid itinerary ID."));
    return;
  }
  next();
});

router.post("/", validateBody(createItinerarySchema), createItinerary);
router.get("/", listItineraries);
router.get("/:id/pdf", exportItineraryPdf);
router.get("/:id", getItinerary);
router.put("/:id", validateBody(updateItinerarySchema), updateItinerary);
router.delete("/:id", deleteItinerary);

export default router;
