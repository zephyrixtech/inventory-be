import jwt, { type JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';

import { config } from '../config/env';

export type TokenPayload = {
  sub: string;
  company: string;
  role: string;
  permissions?: string[];
};

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
};

export const verifyAccessToken = (token: string): TokenPayload & JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload & JwtPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload & JwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload & JwtPayload;
};

export const buildTokenPayload = (params: { userId: Types.ObjectId; companyId: Types.ObjectId; roleId: Types.ObjectId; permissions?: string[] }): TokenPayload => {
  return {
    sub: params.userId.toString(),
    company: params.companyId.toString(),
    role: params.roleId.toString(),
    permissions: params.permissions
  };
};

