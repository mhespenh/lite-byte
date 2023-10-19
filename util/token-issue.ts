import { AuthUser, LiteByte } from "@prisma/client";
// Using jose instead of jsonwebtoken, because the latter isn't support
// in nextjs's edge runtime :(
import { SignJWT, importPKCS8 } from "jose";

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
