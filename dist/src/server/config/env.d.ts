export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    APP_URL: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    COOKIE_NAME: string;
    UPLOAD_DIR: string;
    MAX_UPLOAD_MB: number;
    TRUST_PROXY: boolean;
    PAYMENT_PROVIDER: "fakepay" | "stripe" | "iyzico";
    DIRECT_URL?: string | undefined;
    STRIPE_SECRET_KEY?: string | undefined;
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    IYZICO_API_KEY?: string | undefined;
    IYZICO_SECRET_KEY?: string | undefined;
};
export declare const isProd: boolean;
export declare const cookieOptions: {
    readonly httpOnly: true;
    readonly secure: boolean;
    readonly sameSite: "lax";
    readonly path: "/";
    readonly maxAge: number;
};
//# sourceMappingURL=env.d.ts.map