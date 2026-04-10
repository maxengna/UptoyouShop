import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    login(loginDto: LoginDto, response: Response): Promise<{
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
    refreshToken(refreshTokenDto: RefreshTokenDto, request: Request): Promise<{
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
        };
        message: string;
        errors: never[];
    }>;
    logout(userId: string, response: Response): Promise<{
        success: boolean;
        data: null;
        message: string;
        errors: never[];
    }>;
    getProfile(user: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        errors: never[];
    }>;
}
