import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
      image: '/categories/electronics.jpg',
    },
  })

  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
      image: '/categories/clothing.jpg',
    },
  })

  const home = await prisma.category.create({
    data: {
      name: 'Home & Garden',
      slug: 'home',
      description: 'Home decor and garden supplies',
      image: '/categories/home.jpg',
    },
  })

  const sports = await prisma.category.create({
    data: {
      name: 'Sports',
      slug: 'sports',
      description: 'Sports equipment and accessories',
      image: '/categories/sports.jpg',
    },
  })

  console.log('✅ Categories created')

  // Create products
  const products = [
    {
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality.',
      price: 299.99,
      originalPrice: 399.99,
      sku: 'WH-001',
      stock: 15,
      categoryId: electronics.id,
      isNew: true,
      isOnSale: true,
      tags: ['wireless', 'headphones', 'bluetooth', 'noise-cancelling'],
      weight: 0.25,
      dimensions: { length: 20, width: 18, height: 8 },
      seoTitle: 'Premium Wireless Headphones - Noise Cancelling',
      seoDescription: 'Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation.',
    },
    {
      name: 'Smart Watch',
      slug: 'smart-watch',
      description: 'Feature-rich smartwatch with health tracking, GPS, and smartphone integration.',
      price: 199.99,
      originalPrice: 249.99,
      sku: 'SW-003',
      stock: 8,
      categoryId: electronics.id,
      isOnSale: true,
      tags: ['smartwatch', 'fitness', 'health', 'gps'],
      weight: 0.05,
      dimensions: { length: 4.4, width: 3.8, height: 1.1 },
      seoTitle: 'Smart Watch with Health Tracking',
      seoDescription: 'Stay connected and track your fitness with our advanced smartwatch.',
    },
    {
      name: 'Organic Cotton T-Shirt',
      slug: 'organic-cotton-tshirt',
      description: 'Comfortable and sustainable organic cotton t-shirt perfect for everyday wear.',
      price: 29.99,
      sku: 'CT-002',
      stock: 50,
      categoryId: clothing.id,
      tags: ['cotton', 'organic', 't-shirt', 'sustainable'],
      weight: 0.15,
      dimensions: { length: 28, width: 20, height: 1 },
      seoTitle: 'Organic Cotton T-Shirt',
      seoDescription: 'Eco-friendly and comfortable organic cotton t-shirt for sustainable fashion.',
    },
    {
      name: 'Laptop Stand',
      slug: 'laptop-stand',
      description: 'Adjustable aluminum laptop stand for ergonomic workspace setup.',
      price: 49.99,
      sku: 'LS-004',
      stock: 25,
      categoryId: electronics.id,
      tags: ['laptop', 'stand', 'ergonomic', 'aluminum'],
      weight: 1.2,
      dimensions: { length: 25, width: 20, height: 15 },
      seoTitle: 'Adjustable Laptop Stand',
      seoDescription: 'Improve your posture and workspace with our adjustable laptop stand.',
    },
    {
      name: 'USB-C Hub',
      slug: 'usb-c-hub',
      description: '7-in-1 USB-C hub with multiple ports for all your connectivity needs.',
      price: 39.99,
      sku: 'UH-005',
      stock: 30,
      categoryId: electronics.id,
      tags: ['usb-c', 'hub', 'connectivity', 'multi-port'],
      weight: 0.08,
      dimensions: { length: 12, width: 4, height: 1.5 },
      seoTitle: '7-in-1 USB-C Hub',
      seoDescription: 'Expand your connectivity with our versatile 7-in-1 USB-C hub.',
    },
    {
      name: 'Wireless Mouse',
      slug: 'wireless-mouse',
      description: 'Ergonomic wireless mouse with precision tracking and long battery life.',
      price: 29.99,
      sku: 'WM-006',
      stock: 40,
      categoryId: electronics.id,
      tags: ['mouse', 'wireless', 'ergonomic', 'precision'],
      weight: 0.1,
      dimensions: { length: 11, width: 6, height: 3.5 },
      seoTitle: 'Ergonomic Wireless Mouse',
      seoDescription: 'Work comfortably with our ergonomic wireless mouse featuring precision tracking.',
    },
    {
      name: 'Mechanical Keyboard',
      slug: 'mechanical-keyboard',
      description: 'RGB mechanical keyboard with blue switches and customizable backlighting.',
      price: 89.99,
      sku: 'MK-007',
      stock: 12,
      categoryId: electronics.id,
      isNew: true,
      tags: ['keyboard', 'mechanical', 'rgb', 'gaming'],
      weight: 0.8,
      dimensions: { length: 45, width: 15, height: 4 },
      seoTitle: 'RGB Mechanical Keyboard',
      seoDescription: 'Enhance your typing experience with our RGB mechanical keyboard.',
    },
    {
      name: 'Yoga Mat',
      slug: 'yoga-mat',
      description: 'Eco-friendly non-slip yoga mat with carrying strap.',
      price: 39.99,
      sku: 'YM-004',
      stock: 25,
      categoryId: sports.id,
      tags: ['yoga', 'mat', 'exercise', 'eco-friendly'],
      weight: 1.5,
      dimensions: { length: 183, width: 61, height: 0.6 },
      seoTitle: 'Eco-Friendly Yoga Mat',
      seoDescription: 'Practice yoga sustainably with our eco-friendly non-slip yoga mat.',
    },
  ]

  const createdProducts = []
  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    })
    createdProducts.push(product)
  }

  console.log(`✅ Created ${createdProducts.length} products`)

  // Create product images
  for (const product of createdProducts) {
    const images = [
      { url: `/products/${product.slug}-1.jpg`, isMain: true },
      { url: `/products/${product.slug}-2.jpg`, isMain: false },
      { url: `/products/${product.slug}-3.jpg`, isMain: false },
    ]

    for (const imageData of images) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          ...imageData,
        },
      })
    }
  }

  console.log('✅ Product images created')

  // Create product variants for some products
  const headphones = createdProducts.find(p => p.slug === 'wireless-headphones')
  if (headphones) {
    const variants = [
      { name: 'Color', value: 'Black', sku: 'WH-001-BLK', price: 299.99 },
      { name: 'Color', value: 'Silver', sku: 'WH-001-SLV', price: 299.99 },
      { name: 'Color', value: 'Blue', sku: 'WH-001-BLU', price: 319.99 },
    ]

    for (const variantData of variants) {
      await prisma.productVariant.create({
        data: {
          productId: headphones.id,
          ...variantData,
        },
      })
    }
  }

  const tshirt = createdProducts.find(p => p.slug === 'organic-cotton-tshirt')
  if (tshirt) {
    const variants = [
      { name: 'Size', value: 'Small', sku: 'CT-002-SML', price: 29.99 },
      { name: 'Size', value: 'Medium', sku: 'CT-002-MED', price: 29.99 },
      { name: 'Size', value: 'Large', sku: 'CT-002-LRG', price: 29.99 },
      { name: 'Size', value: 'XL', sku: 'CT-002-XL', price: 34.99 },
    ]

    for (const variantData of variants) {
      await prisma.productVariant.create({
        data: {
          productId: tshirt.id,
          ...variantData,
        },
      })
    }
  }

  console.log('✅ Product variants created')

  // Create inventory records
  for (const product of createdProducts) {
    await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity: product.stock,
        reorderLevel: 5,
      },
    })
  }

  console.log('✅ Inventory records created')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@uptoyoushop.com',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  })

  // Create test customer user
  const customerPassword = await bcrypt.hash('customer123', 10)
  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      name: 'John Doe',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      emailVerified: true,
    },
  })

  console.log('✅ Users created')

  // Create customer addresses
  await prisma.address.create({
    data: {
      userId: customerUser.id,
      type: 'SHIPPING',
      firstName: 'John',
      lastName: 'Doe',
      company: '',
      address1: '123 Main Street',
      address2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 555-123-4567',
      isDefault: true,
    },
  })

  console.log('✅ Customer address created')

  // Create sample reviews
  const reviewProducts = createdProducts.slice(0, 3)
  for (const product of reviewProducts) {
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: customerUser.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        title: `Great ${product.name}!`,
        content: `I really love this ${product.name.toLowerCase()}. It exceeded my expectations and I would definitely recommend it to others.`,
        isVerified: true,
      },
    })
  }

  console.log('✅ Sample reviews created')

  // Create shipping methods
  const shippingMethods = [
    { name: 'Standard Shipping', description: '5-7 business days', price: 9.99 },
    { name: 'Express Shipping', description: '2-3 business days', price: 19.99 },
    { name: 'Overnight Shipping', description: 'Next business day', price: 29.99 },
    { name: 'Free Shipping', description: '7-10 business days', price: 0 },
  ]

  for (const methodData of shippingMethods) {
    await prisma.shippingMethod.create({
      data: methodData,
    })
  }

  console.log('✅ Shipping methods created')

  // Create coupons
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      name: 'Welcome Discount',
      description: '10% off your first order',
      type: 'PERCENTAGE',
      value: 10.00,
      minAmount: 50.00,
      maxUses: 100,
      isActive: true,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  })

  await prisma.coupon.create({
    data: {
      code: 'FREESHIP',
      name: 'Free Shipping',
      description: 'Free shipping on orders over $50',
      type: 'FREE_SHIPPING',
      value: 0,
      minAmount: 50.00,
      maxUses: 200,
      isActive: true,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
  })

  console.log('✅ Coupons created')

  // Create system settings
  await prisma.setting.createMany({
    data: [
      {
        key: 'site_name',
        value: { name: 'UpToYouShop' },
      },
      {
        key: 'site_description',
        value: { description: 'A modern e-commerce platform' },
      },
      {
        key: 'currency',
        value: { currency: 'USD', symbol: '$' },
      },
      {
        key: 'tax_rate',
        value: { rate: 0.08 }, // 8% tax
      },
      {
        key: 'free_shipping_threshold',
        value: { threshold: 50.00 },
      },
    ],
  })

  console.log('✅ System settings created')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
