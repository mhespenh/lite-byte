import { AuthUser } from "@prisma/client";
// Using jose instead of jsonwebtoken, because the latter isn't support
// in nextjs's edge runtime :(
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

type CustomJwtPayload = JWTPayload & {
  scopes: string[];
  name: string;
};

/**
 * Validate a JWT token
 * @param token The JWT token to validate
 * @returns The decoded JWT token if it is valid, false otherwise
 */
export const validateToken = async (token?: string) => {
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    return payload as CustomJwtPayload;
  } catch (e) {
    return false;
  }
};

/**
 * Generate a JWT token
 * @param user The AuthUser object to issue a token for
 * @param expInSeconds (default: 15m) Optional. The time until the token expires in seconds
 * @param scopes (default: ["user"]) Optional. The scopes to issue the token for
 * @returns A signed JWT token
 */
export const issueToken = async (
  user: AuthUser,
  expInSeconds = 60 * 15,
  scopes = ["user"]
) => {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expInSeconds;

  return await new SignJWT({ name: user.name, scopes })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .setIssuer("https://litebyte.mhespenh.com")
    .setSubject(user.email)
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!));
};
