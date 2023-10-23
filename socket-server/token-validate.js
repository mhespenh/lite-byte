var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Using jose instead of jsonwebtoken, because the latter isn't support
// in nextjs's edge runtime :(
import { importSPKI, jwtVerify } from "jose";
/**
 * Validate a JWT token
 * @param token The JWT token to validate
 * @returns The decoded JWT token if it is valid, false otherwise
 */
export const validateToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token)
        return false;
    try {
        const key = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, "\n");
        const parsedKey = yield importSPKI(key, "RS256");
        const { payload } = yield jwtVerify(token, parsedKey);
        return payload;
    }
    catch (e) {
        return false;
    }
});
