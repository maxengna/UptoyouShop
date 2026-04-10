declare const _default: (() => {
    port: number;
    nodeEnv: string;
    corsOrigin: string;
    jwt: {
        secret: string;
        expiration: string;
        refreshSecret: string;
        refreshExpiration: string;
    };
    cookieSecret: string;
    databaseUrl: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    nodeEnv: string;
    corsOrigin: string;
    jwt: {
        secret: string;
        expiration: string;
        refreshSecret: string;
        refreshExpiration: string;
    };
    cookieSecret: string;
    databaseUrl: string | undefined;
}>;
export default _default;
