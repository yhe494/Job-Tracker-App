import {Schema, model,Types} from 'mongoose';

export interface IApplication{
    company: string;
    roleTitle: string;
    description?:string;
    status: 'applied' | 'interviewing' | 'offer' | 'rejected';
    appliedDate?: Date;
    interviewDate?: Date;
    offerDate?: Date;
    rejectionDate?: Date;
    userId: Types.ObjectId;
    jobUrl?: string;
    location?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const ApplicationSchema = new Schema<IApplication>({
    company: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
        trim: true
    },
    roleTitle: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
        trim: true
    },
    description: {
        type: String,
        maxlength: 1000
    },
    status: {
        type: String,
        required: true,
        enum: ['applied', 'interviewing', 'offer', 'rejected'],
        default: 'applied'
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    interviewDate: {
        type: Date
    },
    offerDate: {
        type: Date
    },
    rejectionDate: {
        type: Date
    },
    jobUrl: {
        type: String,
        maxlength: 1000,
        trim: true
    },
    location: {
        type: String,
        minlength: 1,
        maxlength: 255,
        trim: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
},
    {timestamps: true}
);

ApplicationSchema.index({ userId: 1, updatedAt: -1 });
ApplicationSchema.index({ userId: 1, status: 1, updatedAt: -1 });
const Application = model<IApplication>('Application', ApplicationSchema);

export default Application;