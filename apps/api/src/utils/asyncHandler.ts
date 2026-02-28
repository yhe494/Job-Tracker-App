import type {Request, Response, NextFunction, RequestHandler} from 'express';
/**
 * Represents an asynchronous request handler function for Express middleware.
 * @typeParam Request - The Express Request object containing client request information
 * @typeParam Response - The Express Response object used to send responses to clients
 * @typeParam NextFunction - The Express NextFunction callback to pass control to the next middleware
 * @returns A Promise that resolves to any value when the async operation completes
 */
type AsyncRequestHander = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

/**
 * Wraps an async request handler to catch and forward any errors to the Express error handler.
 * @param fn - The async request handler function to wrap
 * @returns A standard Express request handler that automatically catches promise rejections
 */
export function asyncHandler(fn: AsyncRequestHander): RequestHandler {
    return (req, res, next) =>{
        Promise.resolve(fn(req, res, next)).catch(next);
    }
};
