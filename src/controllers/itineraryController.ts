import type { RequestHandler } from "express";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import { z } from "zod";
import { Itinerary } from "../models/Itinerary";
import { User } from "../models/User";
import {
  createItinerarySchema,
  listItinerariesQuerySchema,
  updateItinerarySchema
} from "../schemas/itinerarySchemas";

export const createItinerary: RequestHandler = async (req, res, next) => {
  try {
    const input = createItinerarySchema.parse(req.body);
    const itinerary = await Itinerary.create({
      ...input,
      userId: new mongoose.Types.ObjectId(req.user!.id),
      status: input.status ?? "draft"
    });
    res.status(201).json({ itinerary });
  } catch (error) {
    next(error);
  }
};

export const listItineraries: RequestHandler = async (req, res, next) => {
  try {
    const query = listItinerariesQuerySchema.parse(req.query);
    const filter: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(req.user!.id)
    };
    if (query.destination) filter.destination = query.destination;
    if (query.status) filter.status = query.status;

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      Itinerary.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      Itinerary.countDocuments(filter)
    ]);

    res.json({
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getItinerary: RequestHandler = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user!.id
    }).lean();
    if (!itinerary) {
      res.status(404).json({ error: "Itinerary not found." });
      return;
    }
    res.json({ itinerary });
  } catch (error) {
    next(error);
  }
};

export const updateItinerary: RequestHandler = async (req, res, next) => {
  try {
    const changes = updateItinerarySchema.parse(req.body);
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user!.id
    });
    if (!itinerary) {
      res.status(404).json({ error: "Itinerary not found." });
      return;
    }

    const startDate = changes.startDate
      ? new Date(changes.startDate)
      : itinerary.startDate;
    const endDate = changes.endDate
      ? new Date(changes.endDate)
      : itinerary.endDate;
    if (startDate > endDate) {
      next(new z.ZodError([{
        code: "custom",
        path: ["endDate"],
        message: "endDate must be on or after startDate."
      }]));
      return;
    }

    Object.assign(itinerary, changes);
    await itinerary.save();
    res.json({ itinerary });
  } catch (error) {
    next(error);
  }
};

export const deleteItinerary: RequestHandler = async (req, res, next) => {
  try {
    const result = await Itinerary.deleteOne({
      _id: req.params.id,
      userId: req.user!.id
    });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Itinerary not found." });
      return;
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  });
}

export const exportItineraryPdf: RequestHandler = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user!.id
    }).lean();
    if (!itinerary) {
      res.status(404).json({ error: "Itinerary not found." });
      return;
    }

    const user = await User.findById(req.user!.id).select("agencyName").lean();
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const safeFilename = encodeURIComponent(`${itinerary.title}.pdf`);

    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="itinerary.pdf"; filename*=UTF-8''${safeFilename}`
    );
    res.setHeader("Cache-Control", "private, no-store");

    doc.on("error", (error: Error) => {
      if (res.headersSent) res.destroy(error);
      else next(error);
    });
    doc.pipe(res);

    doc.fontSize(10).fillColor("#64748b")
      .text(user?.agencyName || "Itinerary Builder");
    doc.moveDown(0.5);
    doc.fontSize(24).fillColor("#0f172a").text(itinerary.title);
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#334155")
      .text(`Destination: ${itinerary.destination}`)
      .text(`Client: ${itinerary.clientName} (${itinerary.clientEmail})`)
      .text(
        `Travel dates: ${formatDate(itinerary.startDate)} - ${formatDate(itinerary.endDate)}`
      )
      .text(`Status: ${itinerary.status}`);

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cbd5e1").stroke();
    doc.moveDown();

    for (const day of itinerary.days) {
      if (doc.y > 700) doc.addPage();
      doc.fontSize(16).fillColor("#0f172a")
        .text(`Day ${day.dayNumber} - ${formatDate(day.date)}`);
      doc.moveDown(0.4);

      if (day.activities.length === 0) {
        doc.fontSize(10).fillColor("#64748b").text("No activities planned.");
        doc.moveDown();
        continue;
      }

      for (const activity of day.activities) {
        if (doc.y > 730) doc.addPage();
        doc.fontSize(11).fillColor("#1e293b")
          .text(`${activity.time} - ${activity.title}`);
        doc.fontSize(9).fillColor("#475569");
        if (activity.location) doc.text(`Location: ${activity.location}`);
        if (activity.description) doc.text(activity.description);
        if (activity.cost !== undefined) {
          doc.text(`Cost: ${activity.cost.toFixed(2)}`);
        }
        doc.moveDown(0.8);
      }
      doc.moveDown(0.5);
    }

    doc.end();
  } catch (error) {
    if (res.headersSent) {
      res.destroy(error instanceof Error ? error : new Error("PDF generation failed."));
    } else {
      next(error);
    }
  }
};
