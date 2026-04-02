import bcrypt from "bcrypt";
import User from "./auth.model.js";
import {ChangePasswordInput, LoginInput, RegisterInput, UpdateMeInput} from "./auth.schemas.js";
import {signAccessToken, signRefreshToken, verifyRefreshToken, type AccessTokenPayload} from "./auth.tokens.js";
import { Types } from "mongoose";
import Application from "../applications/applications.model.js";


//Salt rounds for bcrypt
const SALT_ROUNDS = 12;
/**
 * Registers a new user with the provided credentials.
 * 
 * @param input - The registration input containing email, password, and name
 * @param input.email - The user's email address
 * @param input.password - The user's password (will be hashed)
 * @param input.name - The user's full name
 * 
 * @returns A promise that resolves to an object containing:
 *   - user: The created user object with id, email, and name
 *   - accessToken: JWT access token for authentication
 *   - refreshToken: JWT refresh token for token renewal
 * 
 * @throws {Error} If a user with the provided email already exists
 * @throws {Error} If user creation fails due to database errors
 * 
 * @example
 * ```
 * const result = await register({
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 *   name: 'John Doe'
 * });
 * ```
 */
export async function register(input: RegisterInput) {
  const { email, password, name } = input;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await User.create({ email, passwordHash, name });

    const payload = { userId: user._id.toString(), email: user.email };

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  } catch (err: any) {
    // handle duplicate key (E11000)
    if (err?.code === 11000) {
      throw new Error("User with this email already exists");
    }
    throw err;
  }
}

/**
 * Authenticates a user with their email and password credentials.
 * 
 * @param input - The login input containing email and password
 * @param input.email - The user's email address
 * @param input.password - The user's password
 * 
 * @returns A promise that resolves to an object containing:
 *   - user: The authenticated user's public profile (id, email, name)
 *   - accessToken: A signed JWT access token for API authentication
 *   - refreshToken: A signed JWT refresh token for obtaining new access tokens
 * 
 * @throws {Error} If the email is not found or password is invalid
 */
export async function login(input : LoginInput){
    const {email, password} = input;

    const user = await User.findOne({email}).select('+passwordHash');
    if(!user){
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if(!isPasswordValid){
        throw new Error("Invalid email or password");
    }

    const payload: AccessTokenPayload = {
        userId: user._id.toString(),
        email: user.email,
    };

    return {
        user:{
            id: user._id.toString(),
            email: user.email,
            name: user.name,
        },
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
    };
}

/**
 * Refreshes the access token using a valid refresh token.
 * 
 * @param refreshToken - The refresh token to validate and use for generating a new access token
 * @returns A promise that resolves to an object containing the new access token
 * @returns The returned object has the structure { accessToken: string }
 * @throws {Error} Throws an error with message "Invalid refresh token" if the user associated with the refresh token is not found
 */
export async function refresh(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new Error("Invalid refresh token");
  }

  const newPayload: AccessTokenPayload = {
    userId: user._id.toString(),
    email: user.email,
  };

  return {
    accessToken: signAccessToken(newPayload),
  };
}

/**
 * Updates the current user's profile information.
 * @param userId - The ID of the user to update. Must be a valid MongoDB ObjectId.
 * @param patch - An object containing the fields to update.
 * @returns A promise that resolves to an object containing the updated user's id, email, and name, or null if the user is not found.
 * @throws Error if the provided userId is not a valid MongoDB ObjectId.
 */
export async function updateMe(userId: string, patch: UpdateMeInput){
  if(!Types.ObjectId.isValid(userId)){
    throw new Error("Invalid user ID");
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: patch },
    { new: true, runValidators: true }
  );
  if(!updated){
    return null;
  }
  
  return {
    id: updated._id.toString(),
    email: updated.email,
    name: updated.name,
  };
}

/**
 * Changes the password for a user.
 * 
 * @param userId - The ID of the user whose password should be changed. Must be a valid MongoDB ObjectId.
 * @param input - The password change input containing the current and new passwords.
 * @param input.currentPassword - The user's current password for verification.
 * @param input.newPassword - The new password to set.
 * @returns A promise that resolves to an object with an `ok` property set to `true` if the password was successfully changed, or `null` if the user is not found.
 * @throws {Error} If the userId is not a valid MongoDB ObjectId.
 * @throws {Error} If the current password is incorrect.
 */
export async function changePassword(userId: string, input: ChangePasswordInput){
  if(!Types.ObjectId.isValid(userId)){
    throw new Error("Invalid user ID");
  }

  const {currentPassword, newPassword} = input;

  const user = await User.findById(userId).select('+passwordHash');
  if(!user) return null;

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if(!ok){
    throw new Error("Current password is incorrect");
  }

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordHash = newHash;
  await user.save();
  return {ok: true};

}

/**
 * Deletes a user account and all associated applications.
 * @param userId - The ID of the user to delete
 * @returns A promise that resolves to an object with `ok: true` if deletion was successful, or `null` if the user was not found
 * @throws {Error} Throws an error if the userId is not a valid MongoDB ObjectId
 */
export async function deleteAccount(userId: string){
  if(!Types.ObjectId.isValid(userId)){
    throw new Error("Invalid user ID");
  }

  await Application.deleteMany({userId: new Types.ObjectId(userId)});

  const deleted = await User.findByIdAndDelete(userId);

  if(!deleted) return null;

  return {ok: true};

}