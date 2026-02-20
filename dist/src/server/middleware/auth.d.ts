import { Request, Response, NextFunction } from 'express';
export interface AuthUser {
    id: string;
    email: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
/**
 * Verifies JWT from httpOnly cookie and attaches user to req.user.
 * Returns 401 JSON if invalid.
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Same as requireAuth but redirects to /temalar (login form) for HTML routes.
 */
export declare function requireAuthHtml(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Optional auth: attaches user if logged in, doesn't fail if not.
 */
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function signToken(userId: string): string;
//# sourceMappingURL=auth.d.ts.map