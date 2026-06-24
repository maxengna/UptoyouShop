import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ConfirmResetPasswordDto } from './dto/confirm-reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      data: user,
      message: 'User registered successfully',
      errors: [],
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store refresh token session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'Login successful',
      errors: [],
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    // Verify refresh token
    const session = await this.prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(session.user);

    // Update session with new refresh token
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'Token refreshed successfully',
      errors: [],
    };
  }

  async socialLogin(provider: 'google' | 'facebook', accessToken: string) {
    let profile: { email: string; name: string; avatar?: string };

    if (provider === 'google') {
      const googleRes = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const googleData = await googleRes.json();
      if (googleData.error || !googleData.email) {
        throw new UnauthorizedException('Invalid Google token');
      }
      profile = {
        email: googleData.email,
        name: googleData.name || googleData.email.split('@')[0],
        avatar: googleData.picture,
      };
    } else {
      const fbUrl = `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${encodeURIComponent(accessToken)}`;
      const fbRes = await fetch(fbUrl);
      const fbData = await fbRes.json();
      if (fbData.error || !fbData.email) {
        throw new UnauthorizedException('Invalid Facebook token');
      }
      profile = {
        email: fbData.email,
        name: fbData.name || fbData.email.split('@')[0],
        avatar: fbData.picture?.data?.url,
      };
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
          emailVerified: true,
        },
      });
    } else {
      const updateData: any = {};
      if (profile.name) updateData.name = profile.name;
      if (profile.avatar) updateData.avatar = profile.avatar;
      if (!user.emailVerified) updateData.emailVerified = true;
      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store refresh token session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: `${provider} login successful`,
      errors: [],
    };
  }

  async logout(userId: string) {
    // Delete all sessions for user
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    return {
      success: true,
      data: null,
      message: 'Logged out successfully',
      errors: [],
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Always return success to prevent email enumeration
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      // Generate reset token (32 random bytes = 64 hex chars)
      const token = crypto.randomBytes(32).toString('hex');

      // Expires in 1 hour
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await this.prisma.passwordResetToken.create({
        data: { email, token, expiresAt },
      });

      const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
      const resetLink = `${this.configService.get<string>('app.frontendUrl', 'http://localhost:3000')}/reset-password/${token}`;

      if (nodeEnv === 'development') {
        console.log('\n========================================');
        console.log('  PASSWORD RESET LINK');
        console.log(`  To: ${email}`);
        console.log(`  Link: ${resetLink}`);
        console.log('========================================\n');
      }

      this.mailService.sendForgotPasswordEmail(email, token).catch((err) => {
        console.error('Failed to send password reset email:', err);
        if (nodeEnv === 'development') {
          console.log(`\n⚠️  SES failed. Use this link directly: ${resetLink}\n`);
        }
      });
    }

    return {
      success: true,
      data: null,
      message: 'If the email exists, a reset link has been sent',
      errors: [],
    };
  }

  async verifyResetToken(token: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    return {
      success: true,
      data: { email: resetToken.email },
      message: 'Token is valid',
      errors: [],
    };
  }

  async confirmResetPassword(confirmResetPasswordDto: ConfirmResetPasswordDto) {
    const { token, password } = confirmResetPasswordDto;

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetToken.usedAt) {
      throw new BadRequestException('Reset token has already been used');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { email: resetToken.email },
      data: { passwordHash },
    });

    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    return {
      success: true,
      data: null,
      message: 'Password reset successfully',
      errors: [],
    };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return { accessToken, refreshToken };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
      },
    });

    return user;
  }
}
