import {changePassword, deleteAccount, login, refresh, register, updateMe} from "./auth.service.js";
import {asyncHandler} from "../../utils/asyncHandler.js";
import { registerSchema , loginSchema, updateMeSchema, changePasswordSchema} from "./auth.schemas.js";
import {getRefreshCookieOptions} from "./auth.tokens.js";
import type {Request, Response} from 'express';


/**
 * Retrieves the current authenticated user's information.
 * 
 * @param req - The Express request object containing the authenticated user
 * @param res - The Express response object used to send the response
 * @returns A promise that resolves to a JSON response containing the authenticated user object
 * @throws May throw errors handled by the asyncHandler middleware
 */
export const meHandler = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json({ user: req.user });
});

/**
 * Handles user registration requests.
 * 
 * Validates the request body against the register schema, creates a new user account,
 * and returns authentication tokens. The refresh token is set as an HTTP-only cookie,
 * while the access token is returned in the response body.
 * 
 * @param req - Express request object containing registration data in the body
 * @param res - Express response object
 * @returns JSON response with status 201 containing the created user and access token
 * @throws {ZodError} If the request body fails schema validation
 */
export const registerHandler = asyncHandler(async (req: Request, res:Response) => {
    const input = registerSchema.parse(
        req.body
    );

    const { user, accessToken, refreshToken } = await register(input);
    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());
    return res.status(201).json({ user, accessToken });
});

/**
 * Handles user login requests.
 * 
 * Validates the request body against the login schema, authenticates the user,
 * and returns user data with an access token. A refresh token is set as an HTTP-only cookie.
 * 
 * @param req - Express request object containing login credentials in the body
 * @param res - Express response object used to send the response and set cookies
 * @returns Promise resolving to a JSON response containing the authenticated user and access token
 * @throws Will pass validation errors from loginSchema.parse() to the error handler
 */
export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
    const input = loginSchema.parse(req.body);

    const { user, accessToken, refreshToken } = await login(input);
    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());
    return res.status(200).json({ user, accessToken });

});

/**
 * Handles refresh token requests and issues new access tokens.
 * 
 * @param req - The Express request object containing the refresh token in cookies
 * @param res - The Express response object used to send the token response
 * 
 * @returns A JSON response containing the new access token. If a new refresh token is issued,
 * it is set as an HTTP-only cookie.
 * 
 * @throws Returns a 401 status if no refresh token is provided in the request cookies
 * 
 * @example
 * // Usage as a route handler
 * router.post('/refresh', refreshHandler);
 */
export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
    // Get the refresh token from the cookies
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        // No refresh token provided
        return res.status(401).json({ message: "No refresh token provided" });
    }

    // Attempt to refresh the access token using the provided refresh token
    const result = await refresh(refreshToken);

    if("refreshToken" in result && result.refreshToken){
        res.cookie("refreshToken", result.refreshToken, getRefreshCookieOptions());
    }
    return res.status(200).json({ accessToken: result.accessToken });

});

/**
 * Handles user logout by clearing the refresh token cookie.
 * @param req - The Express request object
 * @param res - The Express response object
 * @returns A 204 No Content response
 */
export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie("refreshToken", {...getRefreshCookieOptions()});
    return res.status(204).send();
});

export const updateMeHandler = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const patch = updateMeSchema.parse(req.body);
    const user = await updateMe(userId, patch);
    if(!user){
        return res.status(404).json({
            error: {
                code: "NOT_FOUND",
                message: "User not found",
            },
        });
    }
    return res.status(200).json({ user });
});

/**
 * Handles password change requests for authenticated users.
 * 
 * @param req - Express request object containing the authenticated user and password change data
 * @param req.user.userId - The ID of the authenticated user whose password will be changed
 * @param req.body - Request body containing old and new password (validated against changePasswordSchema)
 * @param res - Express response object
 * @returns A 204 No Content response on successful password change
 * @throws Will throw validation error if request body doesn't match changePasswordSchema
 * @throws Will propagate errors from changePassword function
 */
export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const input = changePasswordSchema.parse(req.body);
    await changePassword(userId, input);
    return res.status(204).send();
});

/**
 * Handles the deletion of a user account.
 * 
 * Deletes the user account associated with the authenticated request and clears the refresh token cookie.
 * 
 * @param {Request} req - The Express request object containing the authenticated user's ID
 * @param {Response} res - The Express response object
 * @returns {Promise<void>} Returns a 204 No Content response on success, or a 404 Not Found response if the user does not exist
 * @throws Will not throw, but returns appropriate HTTP status codes for success and error cases
 */
export const deleteAccountHandler = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await deleteAccount(userId);

    if(!result){
        return res.status(404).json({
            error: {
                code: "NOT_FOUND",
                message: "User not found",
            },
        });
    }
    
    res.clearCookie("refreshToken", {...getRefreshCookieOptions()});
    return res.status(204).send();

});
    