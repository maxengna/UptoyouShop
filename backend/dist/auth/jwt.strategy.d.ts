import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly authService;
    constructor(configService: ConfigService, authService: AuthService);
    validate(payload: any): Promise<{
        name: string | null;
        email: string;
        phone: string | null;
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatar: string | null;
    }>;
}
export {};
