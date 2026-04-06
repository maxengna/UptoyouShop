import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../database/prisma";
import { z } from "zod";

// Profile update schema
const updateProfileSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
});

export async function updateProfile(request: NextRequest) {
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
    const validatedData = updateProfileSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        status: 404,
      };
    }

    // Update profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        avatar: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Update profile error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid profile data",
        details: error.errors,
        status: 400,
      };
    }

    return {
      success: false,
      error: "Failed to update profile",
      status: 500,
    };
  }
}

export async function getUserProfile() {
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
        updatedAt: true,
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
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
    console.error("Get profile error:", error);
    return {
      success: false,
      error: "Failed to get profile",
      status: 500,
    };
  }
}

// Address schema
const addressSchema = z.object({
  type: z.enum(["SHIPPING", "BILLING"]),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function addAddress(request: NextRequest) {
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
    const validatedData = addressSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        status: 404,
      };
    }

    // If this is default address, unset other default addresses of same type
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          type: validatedData.type,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Create address
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        ...validatedData,
      },
    });

    return {
      success: true,
      data: address,
      message: "Address added successfully",
    };
  } catch (error) {
    console.error("Add address error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid address data",
        details: error.errors,
        status: 400,
      };
    }

    return {
      success: false,
      error: "Failed to add address",
      status: 500,
    };
  }
}

export async function getUserAddresses() {
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
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        status: 404,
      };
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: "desc" },
    });

    return {
      success: true,
      data: addresses,
    };
  } catch (error) {
    console.error("Get addresses error:", error);
    return {
      success: false,
      error: "Failed to get addresses",
      status: 500,
    };
  }
}

export async function updateAddress(addressId: string, request: NextRequest) {
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
    const validatedData = addressSchema.partial().parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        status: 404,
      };
    }

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!existingAddress) {
      return {
        success: false,
        error: "Address not found",
        status: 404,
      };
    }

    // If this is default address, unset other default addresses of same type
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.id,
          type: existingAddress.type,
          isDefault: true,
          id: { not: addressId },
        },
        data: { isDefault: false },
      });
    }

    // Update address
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: validatedData,
    });

    return {
      success: true,
      data: updatedAddress,
      message: "Address updated successfully",
    };
  } catch (error) {
    console.error("Update address error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid address data",
        details: error.errors,
        status: 400,
      };
    }

    return {
      success: false,
      error: "Failed to update address",
      status: 500,
    };
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401,
      };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        status: 404,
      };
    }

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!existingAddress) {
      return {
        success: false,
        error: "Address not found",
        status: 404,
      };
    }

    // Check if user has other addresses
    const addressCount = await prisma.address.count({
      where: { userId: user.id },
    });

    if (addressCount === 1) {
      return {
        success: false,
        error: "Cannot delete the only address",
        status: 400,
      };
    }

    // Delete address
    await prisma.address.delete({
      where: { id: addressId },
    });

    return {
      success: true,
      message: "Address deleted successfully",
    };
  } catch (error) {
    console.error("Delete address error:", error);
    return {
      success: false,
      error: "Failed to delete address",
      status: 500,
    };
  }
}

export async function getUserOrderHistory(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401,
      };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        status: 404,
      };
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    // Build where clause
    const where: any = { userId: user.id };
    if (status) {
      where.status = status.toUpperCase();
    }

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            variant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count
    const total = await prisma.order.count({ where });

    return {
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get order history error:", error);
    return {
      success: false,
      error: "Failed to get order history",
      status: 500,
    };
  }
}
