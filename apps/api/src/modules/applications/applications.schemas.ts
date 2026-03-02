import { z } from "zod";

const companySchema = z.string().min(1).max(255).trim();
const roleTitleSchema = z.string().min(1).max(255).trim();
const descriptionSchema = z.string().max(1000);
const statusSchema = z.enum(["applied", "interviewing", "offer", "rejected"]);
const jobUrlSchema = z.string().max(1000).trim();
const locationSchema = z.string().min(1).max(255).trim();

export const createApplicationSchema = z.object({
  company: companySchema,
  roleTitle: roleTitleSchema,
  description: descriptionSchema.optional(),
  status: statusSchema.optional(), 
  appliedDate: z.coerce.date().optional(),
  interviewDate: z.coerce.date().optional(),
  offerDate: z.coerce.date().optional(),
  rejectionDate: z.coerce.date().optional(),
  jobUrl: jobUrlSchema.optional(),
  location: locationSchema.optional(),
});

export const updateApplicationSchema = z
  .object({
    company: companySchema.optional(),
    roleTitle: roleTitleSchema.optional(),
    description: descriptionSchema.optional(),
    status: statusSchema.optional(),
    appliedDate: z.coerce.date().optional(),
    interviewDate: z.coerce.date().optional(),
    offerDate: z.coerce.date().optional(),
    rejectionDate: z.coerce.date().optional(),
    jobUrl: jobUrlSchema.optional(),
    location: locationSchema.optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided for update",
  });

export const listApplicationsQuerySchema = z.object({
  status: statusSchema.optional(),
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().trim().optional(),
});