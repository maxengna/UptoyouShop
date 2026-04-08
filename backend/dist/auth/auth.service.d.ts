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
        data: $Result.GetResult<import(".prisma/client").Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>;
        message: string;
        errors: never[];
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        data: {
            user: {
                id: any;
                email: any;
                name: any;
                phone: any;
                role: any;
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
    validateUser(userId: string): Promise<any>;
}
