import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const SESSION_COOKIE = "rusetat_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 8;

export interface SessionClaims {
  sub: string;
  email: string;
  name: string;
  role: "admin" | "consultant";
}

function getSigningKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || new TextEncoder().encode(secret).length < 32) {
    throw new Error("AUTH_SECRET must be configured with at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  role: SessionClaims["role"];
}): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSigningKey());
}

export async function verifySessionToken(token: string): Promise<SessionClaims | undefined> {
  try {
    const { payload } = await jwtVerify(token, getSigningKey());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "admin" && payload.role !== "consultant")
    ) {
      return undefined;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return undefined;
  }
}
