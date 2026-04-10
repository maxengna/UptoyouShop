"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)("app", () => ({
    port: parseInt(process.env.PORT || "5000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
    jwt: {
        secret: process.env.JWT_SECRET || "default-secret",
        expiration: process.env.JWT_EXPIRATION || "15m",
        refreshSecret: process.env.JWT_REFRESH_SECRET || "default-refresh-secret",
        refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "7d",
    },
    cookieSecret: process.env.COOKIE_SECRET || "default-cookie-secret",
    databaseUrl: process.env.DATABASE_URL,
}));
//# sourceMappingURL=app.config.js.map