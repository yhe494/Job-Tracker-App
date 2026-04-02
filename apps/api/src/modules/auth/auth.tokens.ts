import jwt, { SignOptions } from 'jsonwebtoken';
import {env} from '../../config/env';
import type {CookieOptions} from 'express';

//payload type
export interface AccessTokenPayload {
    userId: string;
    email: string;
}

//Sign access token
export function signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as SignOptions);
}

//Sign refresh token
export function signRefreshToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);
}

//Verify access token
export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

//Verify refresh token
export function verifyRefreshToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as AccessTokenPayload;
}

//Cookie options for refresh token
export function getRefreshCookieOptions():CookieOptions{
    const isProduction = env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none":"lax",
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    };
}
    
