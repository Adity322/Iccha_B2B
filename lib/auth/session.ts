import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "iccha_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

const PLACEHOLDER_SECRETS = ["your-super-secret-auth-key-32-chars-min"];

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set in the environment");
  }
  // Anyone who knows the secret can mint a valid SUPER_ADMIN cookie, so refuse weak ones in production.
  const weak = secret.length < 32 || PLACEHOLDER_SECRETS.includes(secret);
  if (weak) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET is weak or still the .env.example placeholder. Generate one with: openssl rand -base64 48");
    }
    console.warn("[auth] AUTH_SECRET is weak/placeholder — fine for local dev, never for production.");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  role: "ADMIN" | "SUPER_ADMIN" | "OPERATIONS_MANAGER" | "RETAILER" | "VENDOR";
  email: string;
};

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS };