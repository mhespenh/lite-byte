// Using jose instead of jsonwebtoken, because the latter isn't support
// in nextjs's edge runtime :(
import { importSPKI, jwtVerify, type JWTPayload } from "jose";

type CustomJwtPayload = JWTPayload & {
  scopes: string[];
  name: string;
  devices?: { id: number; serial: string }[];
};

/**
 * Validate a JWT token
 * @param token The JWT token to validate
 * @returns The decoded JWT token if it is valid, false otherwise
 */
export const validateToken = async (token?: string) => {
  if (!token) return false;

  try {
    const key = process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, "\n");
    const parsedKey = await importSPKI(key, "RS256");
    const { payload } = await jwtVerify(token, parsedKey);
    return payload as CustomJwtPayload;
  } catch (e) {
    return false;
  }
};
