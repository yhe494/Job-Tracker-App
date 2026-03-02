import { Types } from "mongoose";
import Application from "./applications.model";
import type { z } from "zod";
import { createApplicationSchema, listApplicationsQuerySchema, updateApplicationSchema } from "./applications.schemas";

type CreateInput = z.infer<typeof createApplicationSchema>;
type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
type UpdateApplication = z.infer<typeof updateApplicationSchema>;
/**
 * Converts a job application document to a data transfer object (DTO).
 * 
 * @param app - The job application object to convert. Contains MongoDB document properties.
 * @returns A DTO object with serialized IDs and application details including company,
 *          role title, status, and relevant dates (applied, interview, offer, rejection).
 */
function toDto(app: any) {
  return {
    id: app._id.toString(),
    userId: app.userId.toString(),
    company: app.company,
    roleTitle: app.roleTitle,
    description: app.description,
    status: app.status,
    appliedDate: app.appliedDate,
    interviewDate: app.interviewDate,
    offerDate: app.offerDate,
    rejectionDate: app.rejectionDate,
    jobUrl: app.jobUrl,
    location: app.location,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}

/**
 * Creates a new job application for a user.
 * @param userId - The ID of the user creating the application. Must be a valid MongoDB ObjectId.
 * @param input - The application data to create.
 * @returns A promise that resolves to the created application as a DTO.
 * @throws {Error} If the userId is not a valid MongoDB ObjectId.
 */
export async function createApplication(userId: string, input: CreateInput) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user id");
  }

  const application = await Application.create({
    userId: new Types.ObjectId(userId),
    ...input,
  });

  return toDto(application);
}

/**
 * Lists job applications for a specific user with filtering and pagination support.
 * @param userId - The ID of the user whose applications to retrieve
 * @param query - Query parameters for filtering and pagination
 * @param query.status - Optional filter by application status
 * @param query.q - Optional search query to filter by company or role title (case-insensitive)
 * @param query.page - The page number for pagination (1-indexed)
 * @param query.limit - The number of items per page
 * @param query.sort - The sort order (e.g., "updatedAt:desc", "appliedDate:asc", "company:asc")
 * @returns A promise that resolves to an object containing:
 *   - items: Array of application DTOs
 *   - page: Current page number
 *   - limit: Items per page
 *   - total: Total number of matching applications
 *   - totalPages: Total number of pages
 * @throws {Error} If the userId is not a valid MongoDB ObjectId
 */
export async function listApplications(userId: string, query: ListApplicationsQuery) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user id");
  }

  const { status, q, page, limit, sort } = query;

  const filter: Record<string, any> = { userId: new Types.ObjectId(userId) };

  if (status) filter.status = status;

  if (q && q.length > 0) {
    const regex = new RegExp(q, "i");
    filter.$or = [{ company: regex }, { roleTitle: regex }];
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    "updatedAt:desc": { updatedAt: -1 },
    "updatedAt:asc": { updatedAt: 1 },
    "appliedDate:desc": { appliedDate: -1 },
    "appliedDate:asc": { appliedDate: 1 },
    "company:asc": { company: 1 },
    "company:desc": { company: -1 },
  };

  const sortSpec = sortMap[sort ?? "updatedAt:desc"] ?? sortMap["updatedAt:desc"];
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Application.find(filter).sort(sortSpec).skip(skip).limit(limit),
    Application.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items: items.map(toDto),
    page,
    limit,
    total,
    totalPages,
  };
}

/**
 * Retrieves an application by its ID for a specific user.
 * @param userId - The ID of the user who owns the application
 * @param applicationId - The ID of the application to retrieve
 * @returns A promise that resolves to the application data transfer object, or null if not found
 * @throws {Error} Throws an error if the applicationId is not a valid MongoDB ObjectId
 * @throws {Error} Throws an error if the userId is not a valid MongoDB ObjectId
 */
export async function getApplicationById(userId: string, applicationId: string) {
    if (!Types.ObjectId.isValid(applicationId)) {
        throw new Error("Invalid application id");
    }
    if (!Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user id");
    }

    const application = await Application.findOne({
        _id: new Types.ObjectId(applicationId),
        userId: new Types.ObjectId(userId),
    });

    if(!application){
        return null;
    }
    return toDto(application);
}

/**
 * Updates an application document for a specific user.
 * 
 * @param userId - The ID of the user who owns the application
 * @param applicationId - The ID of the application to update
 * @param patch - The partial update object containing fields to modify
 * @returns A promise that resolves to the updated application DTO, or null if the application is not found
 * @throws {Error} Throws an error if the applicationId is invalid
 * @throws {Error} Throws an error if the userId is invalid
 * 
 * @remarks
 * - The userId field cannot be updated via the patch object for security reasons
 * - Uses MongoDB findOneAndUpdate with validation enabled
 * - Returns the updated document in the response
 */
export async function updateApplication(
    userId: string,
    applicationId: string,
    patch:UpdateApplication
){
    if (!Types.ObjectId.isValid(applicationId)) {
        throw new Error("Invalid application id");
    }
    if (!Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user id");
    }

    //never allow userId to be updated via patch
    const {...safePatch} = patch as any;

    delete safePatch.userId;

    const application = await Application.findOneAndUpdate(
        {
            _id: new Types.ObjectId(applicationId),
            userId: new Types.ObjectId(userId),
        },
        {
            $set: safePatch,
        },
        {
            new: true,
            runValidators: true,
        }
    );
    if(!application) return null;
    return toDto(application);
}

/**
 * Deletes an application by its ID, ensuring it belongs to the specified user.
 * @param userId - The ID of the user who owns the application
 * @param applicationId - The ID of the application to delete
 * @returns A promise that resolves to the deleted application document, or null if not found
 * @throws {Error} If the applicationId is not a valid MongoDB ObjectId
 * @throws {Error} If the userId is not a valid MongoDB ObjectId
 */
export async function deleteApplicationById(
    userId: string,
    applicationId: string,
){
    if (!Types.ObjectId.isValid(applicationId)) {
        throw new Error("Invalid application id");
    }
    if (!Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user id");
    }

    return Application.findOneAndDelete({
        _id: new Types.ObjectId(applicationId),
        userId: new Types.ObjectId(userId),
    });
}



