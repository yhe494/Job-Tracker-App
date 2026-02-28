import bcrypt from "bcrypt";
import User from "./auth.model";
import {LoginInput, RegisterInput} from "./auth.schemas";
import {signAccessToken, signRefreshToken, verifyRefreshToken, type AccessTokenPayload} from "./auth.tokens";

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
