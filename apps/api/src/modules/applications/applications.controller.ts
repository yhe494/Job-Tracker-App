import { createApplication, listApplications , getApplicationById, updateApplication, deleteApplicationById, getApplicationStats} from "./applications.service";
import { asyncHandler } from "../../utils/asyncHandler";
import type {Request, Response} from 'express';
import { createApplicationSchema, listApplicationsQuerySchema } from "./applications.schemas";

/**
 * Handles the creation of a new job application.
 * 
 * @param req - Express request object containing user information and application data in the body
 * @param req.user - Authenticated user object with userId property
 * @param req.body - Request body containing application details, validated against createApplicationSchema
 * @param res - Express response object used to send the created application back to the client
 * @returns Promise that resolves to a 201 Created response with the newly created application object
 * @throws Will pass validation errors from createApplicationSchema.parse() to the error handling middleware
 */
export const createApplicationHandler = asyncHandler(async(req: Request, res: Response) => {
    const userId = req.user!.userId;

    //validate input body
    const input = createApplicationSchema.parse(req.body);

    //call service to create application
    const application = await createApplication(userId, input);
    
    return res.status(201).json({application});
    
});

/**
 * Handles HTTP requests to list applications for the authenticated user.
 * Validates query parameters against the schema and retrieves applications
 * based on the provided filters and pagination options.
 *
 * @param {Request} req - The Express request object containing user information and query parameters
 * @param {Response} res - The Express response object used to send the JSON response
 * @returns {Promise<void>} Sends a 200 status with the list of applications
 *
 * @throws {ZodError} If query parameters fail validation against listApplicationsQuerySchema
 * @throws {Error} If the listApplications service call fails
 *
 * @example
 * // GET /applications?status=active&limit=10
 * // Response: { applications: [...], total: 42 }
 */
export const listApplicationsHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;

        //validate query params
        const query = listApplicationsQuerySchema.parse(req.query);

        //call service to list applications
        const result = await listApplications(userId, query);
        
        return res.status(200).json(result);
    }
)

export const getApplicationStatsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const stats = await getApplicationStats(userId);

    return res.status(200).json(stats);
  }
);

/**
 * Handles retrieving an application by its ID.
 * Verifies that the application belongs to the authenticated user before returning it.
 *
 * @param req - The Express request object containing the user ID and application ID in params
 * @param res - The Express response object
 * @returns A promise that resolves to the HTTP response with the application data or a 404 error
 *
 * @example
 * GET /applications/:id
 * Response: { application: { id, userId, ... } }
 *
 * @throws Returns 404 status if the application is not found
 */
export const getApplicationByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const applicationId = String(req.params.id);

    const application = await getApplicationById(userId,  applicationId);

    if (!application) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Application not found",
        },
      });
    }

    return res.status(200).json({ application });
  }
);

/**
 * Handles HTTP requests to update an application by its ID.
 * 
 * @async
 * @param {Request} req - The Express request object containing:
 *   - `req.user.userId` - The ID of the authenticated user
 *   - `req.params.id` - The application ID to update
 *   - `req.body` - The application data to update
 * @param {Response} res - The Express response object
 * @returns {Promise<void>} Sends a JSON response with:
 *   - 200 status with the updated application object on success
 *   - 404 status with an error object if the application is not found
 * @throws Will be caught by asyncHandler middleware
 */
export const updateApplicationByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const applicationId = String(req.params.id);


    const application = await updateApplication(userId, applicationId, req.body);
    
    if (!application) {
        return res.status(404).json({
            error: {
                code: "NOT_FOUND",
                message: "Application not found",
            },
        });
    }
    return res.status(200).json({ application });
});

/**
 * Handles the deletion of an application by its ID.
 * 
 * @param req - The Express request object containing the user ID and application ID to delete
 * @param req.user - The authenticated user object
 * @param req.user.userId - The ID of the authenticated user
 * @param req.params.id - The ID of the application to delete
 * @param res - The Express response object
 * @returns A 204 No Content response on successful deletion, or a 404 Not Found response if the application does not exist
 */
export const deleteApplicationByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const applicationId = String(req.params.id);
    
      const deleted = await deleteApplicationById(userId, applicationId);

  if (!deleted) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Application not found" },
    });
  }

  return res.status(204).send();
});

