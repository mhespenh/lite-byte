import { AuthUser, LiteByte } from "@prisma/client";
// Using jose instead of jsonwebtoken, because the latter isn't support
// in nextjs's edge runtime :(
import {
  SignJWT,
  importPKCS8,
  importSPKI,
  jwtVerify,
  type JWTPayload,
} from "jose";

type CustomJwtPayload = JWTPayload & {
  scopes: string[];
  name: string;
  devices?: Pick<LiteByte, "id" | "serial">[];
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

/**
 * Generate a JWT token
 * @param user The AuthUser object to issue a token for
 * @param expInSeconds (default: 60m) Optional. The time until the token expires in seconds
 * @param scopes (default: ["user"]) Optional. The scopes to issue the token for
 * @returns A signed JWT token
 */
export const issueToken = async (
  user: AuthUser & { LiteByte?: LiteByte[] },
  expInSeconds = 60 * 60,
  scopes = ["user"]
) => {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expInSeconds;
  const key = process.env.JWT_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const parsedKey = await importPKCS8(key, "RS256");

  const devices = user.LiteByte?.map(({ id, serial }) => ({ id, serial }));

  return await new SignJWT({ name: user.name, scopes, devices })
    .setProtectedHeader({ alg: "RS256" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .setIssuer("https://litebyte.mhespenh.com")
    .setSubject(user.email)
    .sign(parsedKey);
};
