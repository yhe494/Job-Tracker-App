import type {Request, Response, NextFunction} from 'express';
import {verifyAccessToken} from "../modules/auth/auth.tokens.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if(!header || !header.startsWith("Bearer ")){
        return res.status(401).json({
            error:{
                code: "Unauthorized",
                message: "No token provided",
            }
        })
    }
    const token = header.slice("Bearer ".length).trim();
    try{
        const payload = verifyAccessToken(token);

        req.user = {
            userId: payload.userId,
            email: payload.email,
        };
        return next();

    }catch(err){
        return res.status(401).json({
            error:{
                code: "Unauthorized",
                message: "Invalid token",
            }
        });
    }
}