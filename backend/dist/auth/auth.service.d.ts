import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        data: {
            name: string | null;
            email: string;
            phone: string | null;
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        };
        message: string;
        errors: never[];
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        data: {
            user: {
                id: string;
                email: string;
                name: string | null;
                phone: string | null;
                role: import(".prisma/client").$Enums.UserRole;
            };
            accessToken: string;
            refreshToken: string;
        };
        message: string;
        errors: never[];
    }>;
    refreshToken(refreshToken: string): Promise<{
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
        };
        message: string;
        errors: never[];
    }>;
    logout(userId: string): Promise<{
        success: boolean;
        data: null;
        message: string;
        errors: never[];
    }>;
    private generateTokens;
    validateUser(userId: string): Promise<{
        name: string | null;
        email: string;
        phone: string | null;
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatar: string | null;
    } | null>;
}
