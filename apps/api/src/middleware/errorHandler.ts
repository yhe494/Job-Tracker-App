import type {Request, Response, NextFunction} from 'express';
import {ZodError} from 'zod';
import jwt from 'jsonwebtoken';

type ApiErrorResponse = {
    error:{
        code:string;
        message:string;
        details?: any;
    }
}

/**
 * Express error handling middleware for processing various types of errors.
 * Handles Zod validation errors, JWT authentication errors, MongoDB duplicate key errors,
 * and generic application errors with appropriate HTTP status codes and structured responses.
 * 
 * @param err - The error object caught by Express
 * @param _req - Express Request object (unused)
 * @param res - Express Response object for sending error responses
 * @param _next - Express NextFunction (unused)
 * 
 * @returns void - Sends a JSON response with appropriate status code and error details
 * 
 * @example
 * app.use(errorHandler);
 */
export function errorHandler(
    err: any,
    _req:Request,
    res:Response<ApiErrorResponse>,
    _next:NextFunction
){
    //Handle Zod validation errors
    if(err instanceof ZodError){
        return res.status(400).json({
            error:{
                code: 'VALIDATION_ERROR',
                message: 'Invalid request data',
                details: err.flatten(),
            }
        })
    }

    //Handle JWT errors
    //token expired or invalid signature
    if(err instanceof jwt.TokenExpiredError){
        return res.status(401).json({
            error:{
                code: 'TOKEN_EXPIRED',
                message: 'Access token has expired',
            }
        })
    }

    //invalid token
    if(err instanceof jwt.JsonWebTokenError){
        return res.status(401).json({
            error:{
                code: 'INVALID_TOKEN',
                message: 'Invalid access token',
            }
        })
    }

    //Mongo duplicate key error
    if(err?.code === 11000){
        return res.status(409).json({
            error:{
                code: 'DUPLICATE_KEY',
                message: 'Resource already exists',
                details: err.keyValue,
            }
        })
    }
    //other errors
    if (err?.type === 'entity.too.large') {
        return res.status(413).json({
            error: {
                code: 'PAYLOAD_TOO_LARGE',
                message: 'Request payload is too large. Please shorten the text input or upload a PDF resume.',
            }
        })
    }

    if(typeof err?.status === "number" && err?.code){
        return res.status(err.status).json({
            error:{
                code: err.code,
                message: err.message ?? 'An error occurred',
                details: err.details,
            }
        })
    }

    //fallback for unhandled errors
    console.error('Unhandled error:', err);
    return res.status(500).json({
        error:{
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
        }
    });
            
}