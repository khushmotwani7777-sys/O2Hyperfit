import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";
import { Role } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-jwt-key-for-o2hyperfit-production-at-least-32-chars"
);

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  memberId?: string; // If role is MEMBER
  trainerId?: string; // If role is TRAINER
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<TokenPayload | null> {
  try {
    // Check Authorization Bearer header first
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      return await verifyToken(token);
    }

    // Check cookie
    const token = req.cookies.get("auth_token")?.value;
    if (token) {
      return await verifyToken(token);
    }

    return null;
  } catch {
    return null;
  }
}

export async function requireAuth(
  req: NextRequest,
  allowedRoles?: Role[]
): Promise<{ user: TokenPayload } | NextResponse> {
  const user = await getSessionFromRequest(req);

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: "Forbidden. Insufficient permissions." },
      { status: 403 }
    );
  }

  return { user };
}
