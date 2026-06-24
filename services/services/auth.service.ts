import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { prisma } from "../../database/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/utils/email";
import { resetPasswordConfirmSchema } from "@/lib/validations/auth";

// Registration schema
const registerSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerUser(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
        status: 409,
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      data: user,
      message: "User registered successfully",
    };
  } catch (error) {
    console.error("Register error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid registration data",
        details: error.errors,
        status: 400,
      };
    }

    return {
      success: false,
      error: "Failed to register user",
      status: 500,
    };
  }
}

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginUser(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return {
        success: false,
        error: "Invalid email or password",
        status: 401,
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid email or password",
        status: 401,
      };
    }

    // Return user data (without password hash)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    };

    return {
      success: true,
      data: userResponse,
      message: "Login successful",
    };
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid login data",
        details: error.errors,
        status: 400,
      };
    }

    return {
      success: false,
      error: "Failed to login",
      status: 500,
    };
  }
}

export async function getCurrentUser() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        avatar: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        status: 404,
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return {
      success: false,
      error: "Failed to get user",
      status: 500,
    };
  }
}

const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export async function requestPasswordReset(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resetPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: { email: user.email, token, expiresAt },
      });

      await sendPasswordResetEmail(user.email, token);
    }

    return {
      success: true,
      message:
        "If an account with this email exists, a password reset link has been sent",
    };
  } catch (error) {
    console.error("Request password reset error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid email",
        details: error.errors,
        status: 400,
      };
    }

    return {
      success: false,
      error: "Failed to request password reset",
      status: 500,
    };
  }
}

export async function verifyResetToken(token: string) {
  try {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return {
        success: false,
        error: "Invalid or expired reset token",
        status: 400,
      };
    }

    return {
      success: true,
      data: { email: record.email },
    };
  } catch (error) {
    console.error("Verify reset token error:", error);
    return {
      success: false,
      error: "Failed to verify reset token",
      status: 500,
    };
  }
}

export async function confirmPasswordReset(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordConfirmSchema.parse(body);

    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return {
        success: false,
        error: "Invalid or expired reset token",
        status: 400,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: record.email },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        status: 404,
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    return {
      success: true,
      message: "Password has been reset successfully",
    };
  } catch (error) {
    console.error("Confirm password reset error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid password data",
        details: error.errors,
        status: 400,
      };
    }

    return {
      success: false,
      error: "Failed to reset password",
      status: 500,
    };
  }
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function changePassword(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401,
      };
    }

    const body = await request.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.passwordHash) {
      return {
        success: false,
        error: "User not found",
        status: 404,
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: "Current password is incorrect",
        status: 401,
      };
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error("Change password error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid password data",
        details: error.errors,
        status: 400,
      };
    }

    return {
      success: false,
      error: "Failed to change password",
      status: 500,
    };
  }
}
