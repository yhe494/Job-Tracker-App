import {Request, Response, NextFunction} from 'express';
import {extractTextFromPdfBuffer} from './resume.service';

export async function uploadResume(req: Request, res:Response, next: NextFunction) {
    try{
        if(!req.file){
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        const extractedText = await extractTextFromPdfBuffer(req.file.buffer);
        return res.status(200).json({
            success:true,
            data:{
                extractedText,
            },
        });
    }catch(error){
        next(error);
    }
}
