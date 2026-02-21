import { Request, Response, NextFunction } from 'express';
export interface AuthUser {
    id: string;
    email: string;
    role: 'MUSTERI' | 'ADMIN';
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
 * Same as requireAuth but redirects to /giris for HTML routes.
 */
export declare function requireAuthHtml(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Requires ADMIN role for HTML routes.
 * Redirects to /panel if MUSTERI, /giris if not logged in.
 */
export declare function requireAdminHtml(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Requires ADMIN role for API routes. Returns 403 JSON if not admin.
 */
export declare function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Optional auth: attaches user if logged in, doesn't fail if not.
 */
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function signToken(userId: string): string;
//# sourceMappingURL=auth.d.ts.map