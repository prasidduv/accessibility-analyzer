import jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET || "dev_access_secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";
const accessExp = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const refreshExp = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export type JwtPayload = {
  sub: string;
  username: string;
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, accessSecret, { expiresIn: accessExp as jwt.SignOptions["expiresIn"] });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshExp as jwt.SignOptions["expiresIn"] });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, refreshSecret) as JwtPayload;
}
