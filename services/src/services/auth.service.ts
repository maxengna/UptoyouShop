import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../database/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Registration schema
const registerSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function registerUser(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists',
        status: 409,
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    return {
      success: true,
      data: user,
      message: 'User registered successfully',
    }
  } catch (error) {
    console.error('Register error:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid registration data',
        details: error.errors,
        status: 400,
      }
    }

    return {
      success: false,
      error: 'Failed to register user',
      status: 500,
    }
  }
}

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function loginUser(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.passwordHash) {
      return {
        success: false,
        error: 'Invalid email or password',
        status: 401,
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Invalid email or password',
        status: 401,
      }
    }

    // Return user data (without password hash)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    }

    return {
      success: true,
      data: userResponse,
      message: 'Login successful',
    }
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid login data',
        details: error.errors,
        status: 400,
      }
    }

    return {
      success: false,
      error: 'Failed to login',
      status: 500,
    }
  }
}

export async function getCurrentUser() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Unauthorized',
        status: 401,
      }
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
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
        status: 404,
      }
    }

    return {
      success: true,
      data: user,
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return {
      success: false,
      error: 'Failed to get user',
      status: 500,
    }
  }
}

// Password reset schema
const resetPasswordSchema = z.object({
  email: z.string().email(),
})

export async function requestPasswordReset(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = resetPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent',
      }
    }

    // TODO: Generate and send password reset token via email
    // For now, just return success
    return {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent',
    }
  } catch (error) {
    console.error('Request password reset error:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid email',
        details: error.errors,
        status: 400,
      }
    }

    return {
      success: false,
      error: 'Failed to request password reset',
      status: 500,
    }
  }
}

// Change password schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export async function changePassword(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Unauthorized',
        status: 401,
      }
    }

    const body = await request.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || !user.passwordHash) {
      return {
        success: false,
        error: 'User not found',
        status: 404,
      }
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: 'Current password is incorrect',
        status: 401,
      }
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    })

    return {
      success: true,
      message: 'Password changed successfully',
    }
  } catch (error) {
    console.error('Change password error:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid password data',
        details: error.errors,
        status: 400,
      }
    }

    return {
      success: false,
      error: 'Failed to change password',
      status: 500,
    }
  }
}
