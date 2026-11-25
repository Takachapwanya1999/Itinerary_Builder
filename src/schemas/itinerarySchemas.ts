import { z } from "zod";

const isoDateTime = z.string().datetime({ offset: true });

const activitySchema = z.object({
  time: z.string().trim().min(1).max(40),
  title: z.string().trim().min(1).max(150),
  description: z.string().max(2000).default(""),
  location: z.string().trim().max(200).default(""),
  cost: z.number().finite().min(0).optional()
}).strict();

const daySchema = z.object({
  dayNumber: z.number().int().min(1),
  date: isoDateTime,
  activities: z.array(activitySchema).max(100).default([])
}).strict();

const itineraryFields = {
  title: z.string().trim().min(1).max(200),
  destination: z.string().trim().min(1).max(200),
  clientName: z.string().trim().min(1).max(100),
  clientEmail: z.string().trim().toLowerCase().email().max(254),
  startDate: isoDateTime,
  endDate: isoDateTime,
  days: z.array(daySchema).max(366).default([]),
  status: z.enum(["draft", "published", "archived"]).optional()
};

export const createItinerarySchema = z
  .object(itineraryFields)
  .strict()
  .superRefine((value, context) => {
    if (new Date(value.startDate) > new Date(value.endDate)) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "endDate must be on or after startDate."
      });
    }
  });

export const updateItinerarySchema = z
  .object(itineraryFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided."
  });

export const listItinerariesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  destination: z.string().trim().min(1).max(200).optional(),
  status: z.enum(["draft", "published", "archived"]).optional()
}).strict();
