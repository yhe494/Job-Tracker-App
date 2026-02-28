import {Schema, model} from 'mongoose';

export interface IUser {
    email: string;
    passwordHash: string;
    name?: string;

}

const UserSchema = new Schema<IUser>({
    email:{
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        unique: true,
        maxlength: 255
    },
    passwordHash:{
        type: String,
        required: true,
        minlength: 60,
        maxlength: 255,
        select: false
    },
    name:{
        type: String,
        required: false,
        minlength: 1,
        maxlength: 255
    },
},
    {timestamps: true}
);

const User = model<IUser>('User', UserSchema);

export default User;