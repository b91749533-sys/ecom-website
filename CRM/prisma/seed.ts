import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    slug: "dior-sauvage-edp",
    name: "Sauvage Eau de Parfum",
    brand: "Dior",
    description: "A radically fresh composition, Sauvage Eau de Parfum is a bold creation where the raw beauty of nature is shaped by Dior's perfumer.",
    notes: "Bergamot, Sichuan Pepper, Ambroxan, Cedar",
    category: "Woody Aromatic",
    gender: "Men",
    concentration: "Eau de Parfum",
    size: "100ml",
    price: 165,
    image: "/products/dior-sauvage-edp.jpg",
    rating: 4.7,
    reviewCount: 2847,
    featured: true,
    stockLevel: 45,
    minStockThreshold: 10,
  },
  {
    slug: "creed-aventus",
    name: "Aventus",
    brand: "Creed",
    description: "Inspired by the dramatic life of a historic emperor, Aventus celebrates strength, vision and success. A fruity yet smoky masterpiece.",
    notes: "Pineapple, Birch, Blackcurrant, Musk, Oakmoss",
    category: "Fruity Woody",
    gender: "Men",
    concentration: "Eau de Parfum",
    size: "100ml",
    price: 495,
    image: "/products/creed-aventus.svg",
    rating: 4.8,
    reviewCount: 1923,
    featured: true,
    stockLevel: 4, // Trigger low stock alert!
    minStockThreshold: 8,
  },
  {
    slug: "bleu-de-chanel-edp",
    name: "Bleu de Chanel Eau de Parfum",
    brand: "Chanel",
    description: "A woody aromatic fragrance for the man who defies convention. Bleu de Chanel reveals a more sensual and enveloping composition.",
    notes: "Citrus, Cedar, Sandalwood, Amber",
    category: "Woody Aromatic",
    gender: "Men",
    concentration: "Eau de Parfum",
    size: "100ml",
    price: 165,
    image: "/products/bleu-de-chanel-edp.jpg",
    rating: 4.6,
    reviewCount: 1654,
    featured: true,
    stockLevel: 12,
    minStockThreshold: 10,
  },
  {
    slug: "baccarat-rouge-540-edp",
    name: "Baccarat Rouge 540",
    brand: "Maison Francis Kurkdjian",
    description: "A luminous and sophisticated woody amber floral. Baccarat Rouge 540 is an ethereal yet powerful signature scent.",
    notes: "Jasmine, Saffron, Cedar, Ambergris",
    category: "Woody Amber Floral",
    gender: "Unisex",
    concentration: "Eau de Parfum",
    size: "70ml",
    price: 325,
    image: "/products/baccarat-rouge-540-edp.jpg",
    rating: 4.9,
    reviewCount: 3102,
    featured: true,
    stockLevel: 18,
    minStockThreshold: 5,
  },
  {
    slug: "tom-ford-ombre-leather",
    name: "Ombré Leather",
    brand: "Tom Ford",
    description: "A textural leather fragrance that captures the wild beauty of the American West. Black leather and cardamom open into jasmine.",
    notes: "Cardamom, Leather, Jasmine, Patchouli, Amber",
    category: "Leather",
    gender: "Unisex",
    concentration: "Eau de Parfum",
    size: "100ml",
    price: 240,
    image: "/products/tom-ford-ombre-leather.jpg",
    rating: 4.7,
    reviewCount: 1432,
    featured: true,
    stockLevel: 3, // Trigger low stock alert!
    minStockThreshold: 5,
  },
  {
    slug: "ysl-y-edp",
    name: "Y Eau de Parfum",
    brand: "Yves Saint Laurent",
    description: "A bold, fresh and woody fragrance for the self-made man. Y Eau de Parfum intensifies the iconic Y signature.",
    notes: "Sage, Geranium, Apple, Cedar, Vetiver",
    category: "Fresh Woody",
    gender: "Men",
    concentration: "Eau de Parfum",
    size: "100ml",
    price: 165,
    image: "/products/ysl-y-edp.jpg",
    rating: 4.5,
    reviewCount: 987,
    featured: false,
    stockLevel: 25,
    minStockThreshold: 10,
  },
  {
    slug: "acqua-di-gio-profondo-edp",
    name: "Acqua di Giò Profondo",
    brand: "Giorgio Armani",
    description: "A deep aquatic marine intensity that plunges into the ocean's mysteries. Marine notes and mandarin meet lavender.",
    notes: "Marine Notes, Mandarin, Lavender, Patchouli, Cedar",
    category: "Aquatic Aromatic",
    gender: "Men",
    concentration: "Eau de Parfum",
    size: "100ml",
    price: 135,
    image: "/products/acqua-di-gio-profondo-edp.jpg",
    rating: 4.6,
    reviewCount: 1245,
    featured: false,
    stockLevel: 30,
    minStockThreshold: 8,
  },
  {
    slug: "parfums-de-marly-layton",
    name: "Layton",
    brand: "Parfums de Marly",
    description: "An elegant, sensual and flamboyant oriental fragrance. Layton blends juicy apple with calming lavender and vanilla.",
    notes: "Apple, Lavender, Pepper, Vanilla, Patchouli",
    category: "Oriental Spicy",
    gender: "Men",
    concentration: "Eau de Parfum",
    size: "125ml",
    price: 400,
    image: "/products/parfums-de-marly-layton.jpg",
    rating: 4.8,
    reviewCount: 876,
    featured: true,
    stockLevel: 15,
    minStockThreshold: 5,
  },
  {
    slug: "le-male-le-parfum",
    name: "Le Male Le Parfum",
    brand: "Jean Paul Gaultier",
    description: "An intense woody oriental that commands attention. Le Male Le Parfum opens with cardamom and lavender.",
    notes: "Cardamom, Lavender, Iris, Vanilla",
    category: "Woody Oriental",
    gender: "Men",
    concentration: "Parfum",
    size: "125ml",
    price: 160,
    image: "/products/le-male-le-parfum.jpg",
    rating: 4.7,
    reviewCount: 1123,
    featured: false,
    stockLevel: 50,
    minStockThreshold: 15,
  },
  {
    slug: "xerjoff-naxos",
    name: "Naxos",
    brand: "Xerjoff",
    description: "A masterpiece of Sicilian elegance from the 1861 collection. Naxos opens with bright citrus and honeyed tobacco.",
    notes: "Lemon, Lavender, Honey, Tobacco, Tonka Bean, Vanilla",
    category: "Gourmand Tobacco",
    gender: "Unisex",
    concentration: "Eau de Parfum",
    size: "100ml",
    price: 236,
    image: "/products/xerjoff-naxos.jpg",
    rating: 4.9,
    reviewCount: 654,
    featured: true,
    stockLevel: 8,
    minStockThreshold: 5,
  },
];

const mockCustomers = [
  {
    email: "sophie.dubois@gmail.com",
    name: "Sophie Dubois",
    phone: "+1 (555) 019-2834",
    address: "742 Evergreen Terrace",
    city: "Springfield",
    state: "IL",
    zip: "62704",
    country: "US",
    totalSpent: 980.0,
    orderCount: 3,
    clv: 980.0,
    notes: "Prefer woody concentrations. Prefers email updates over phone. High LTV VIP.",
    tags: "VIP, Loyal, Woody Aromatic",
    status: "vip",
  },
  {
    email: "james.smith@yahoo.com",
    name: "James Smith",
    phone: "+1 (555) 014-9988",
    address: "123 Maple Street",
    city: "Seattle",
    state: "WA",
    zip: "98101",
    country: "US",
    totalSpent: 165.0,
    orderCount: 1,
    clv: 165.0,
    notes: "Ordered Sauvage. Complained about delivery delay of 1 day.",
    tags: "Men, New Customer",
    status: "active",
  },
  {
    email: "elena.rodriguez@hotmail.com",
    name: "Elena Rodriguez",
    phone: "+1 (555) 012-3456",
    address: "456 Oak Avenue",
    city: "Miami",
    state: "FL",
    zip: "33101",
    country: "US",
    totalSpent: 735.0,
    orderCount: 2,
    clv: 735.0,
    notes: "Purchased Baccarat Rouge and Ombre Leather. Loves sweet-spicy notes.",
    tags: "Loyal, Unisex",
    status: "active",
  },
  {
    email: "clara.vance@gmail.com",
    name: "Clara Vance",
    phone: "+1 (555) 015-8822",
    address: "89 Pine Boulevard",
    city: "Austin",
    state: "TX",
    zip: "78701",
    country: "US",
    totalSpent: 0.0,
    orderCount: 0,
    clv: 0.0,
    notes: "Registered but hasn't ordered yet. Browsed Dior Sauvage.",
    tags: "Inactive, Prospect",
    status: "new",
  },
];

async function main() {
  console.log("Seeding CRM Database...");

  // Delete all existing data
  await prisma.webhookLog.deleteMany();
  await prisma.webhookConfig.deleteMany();
  await prisma.integrationConfig.deleteMany();
  await prisma.emailCampaign.deleteMany();
  await prisma.discountCampaign.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.browsingHistory.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Staff Users
  const adminPassword = process.env.CRM_ADMIN_PASSWORD || "admin123";
  const managerPassword = "manager123";
  const supportPassword = "support123";

  const hashedAdmin = await bcrypt.hash(adminPassword, 12);
  const hashedManager = await bcrypt.hash(managerPassword, 12);
  const hashedSupport = await bcrypt.hash(supportPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: process.env.CRM_ADMIN_EMAIL || "admin@lumiere-crm.com",
      name: "CRM Admin",
      password: hashedAdmin,
      role: "admin",
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "manager@lumiere-crm.com",
      name: "CRM Manager",
      password: hashedManager,
      role: "manager",
    },
  });

  const support = await prisma.user.create({
    data: {
      email: "support@lumiere-crm.com",
      name: "CRM Support",
      password: hashedSupport,
      role: "support",
    },
  });

  console.log("Seeded Staff Users.");

  // 2. Create Products
  const createdProducts: Record<string, any> = {};
  for (const product of products) {
    const p = await prisma.product.create({ data: product });
    createdProducts[product.slug] = p;
  }
  console.log(`Seeded ${products.length} products.`);

  // 3. Create Customers
  const createdCustomers: Record<string, any> = {};
  for (const customer of mockCustomers) {
    const c = await prisma.customer.create({ data: customer });
    createdCustomers[customer.email] = c;
  }
  console.log(`Seeded ${mockCustomers.length} customers.`);

  // 4. Create Mock Orders
  // Order 1: Sophie Dubois (Paid, Shipped)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "LUM-981273",
      customerId: createdCustomers["sophie.dubois@gmail.com"].id,
      email: "sophie.dubois@gmail.com",
      name: "Sophie Dubois",
      address: "742 Evergreen Terrace",
      city: "Springfield",
      state: "IL",
      zip: "62704",
      country: "US",
      status: "shipped",
      paymentStatus: "paid",
      fulfillmentStatus: "fulfilled",
      subtotal: 490.0,
      shipping: 0.0,
      tax: 39.2,
      total: 529.2,
      shippingTracking: "1Z999AA10123456784",
      shippingProvider: "UPS",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      items: {
        create: [
          {
            productId: createdProducts["dior-sauvage-edp"].id,
            name: "Sauvage Eau de Parfum",
            brand: "Dior",
            price: 165.0,
            quantity: 1,
            image: "/products/dior-sauvage-edp.jpg",
          },
          {
            productId: createdProducts["baccarat-rouge-540-edp"].id,
            name: "Baccarat Rouge 540",
            brand: "Maison Francis Kurkdjian",
            price: 325.0,
            quantity: 1,
            image: "/products/baccarat-rouge-540-edp.jpg",
          },
        ],
      },
    },
  });

  // Order 2: Sophie Dubois (Paid, Delivered)
  const order2 = await prisma.order.create({
    data: {
      orderNumber: "LUM-983344",
      customerId: createdCustomers["sophie.dubois@gmail.com"].id,
      email: "sophie.dubois@gmail.com",
      name: "Sophie Dubois",
      address: "742 Evergreen Terrace",
      city: "Springfield",
      state: "IL",
      zip: "62704",
      country: "US",
      status: "delivered",
      paymentStatus: "paid",
      fulfillmentStatus: "fulfilled",
      subtotal: 400.0,
      shipping: 0.0,
      tax: 32.0,
      total: 432.0,
      shippingTracking: "1Z999AA10123456785",
      shippingProvider: "UPS",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      items: {
        create: [
          {
            productId: createdProducts["parfums-de-marly-layton"].id,
            name: "Layton",
            brand: "Parfums de Marly",
            price: 400.0,
            quantity: 1,
            image: "/products/parfums-de-marly-layton.jpg",
          },
        ],
      },
    },
  });

  // Order 3: James Smith (Paid, Pending)
  const order3 = await prisma.order.create({
    data: {
      orderNumber: "LUM-984455",
      customerId: createdCustomers["james.smith@yahoo.com"].id,
      email: "james.smith@yahoo.com",
      name: "James Smith",
      address: "123 Maple Street",
      city: "Seattle",
      state: "WA",
      zip: "98101",
      country: "US",
      status: "processing",
      paymentStatus: "paid",
      fulfillmentStatus: "processing",
      subtotal: 165.0,
      shipping: 10.0,
      tax: 14.0,
      total: 189.0,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      items: {
        create: [
          {
            productId: createdProducts["bleu-de-chanel-edp"].id,
            name: "Bleu de Chanel Eau de Parfum",
            brand: "Chanel",
            price: 165.0,
            quantity: 1,
            image: "/products/bleu-de-chanel-edp.jpg",
          },
        ],
      },
    },
  });

  // Order 4: Elena Rodriguez (Refunded)
  const order4 = await prisma.order.create({
    data: {
      orderNumber: "LUM-982121",
      customerId: createdCustomers["elena.rodriguez@hotmail.com"].id,
      email: "elena.rodriguez@hotmail.com",
      name: "Elena Rodriguez",
      address: "456 Oak Avenue",
      city: "Miami",
      state: "FL",
      zip: "33101",
      country: "US",
      status: "refunded",
      paymentStatus: "refunded",
      fulfillmentStatus: "unfulfilled",
      subtotal: 495.0,
      shipping: 0.0,
      tax: 39.6,
      total: 534.6,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      items: {
        create: [
          {
            productId: createdProducts["creed-aventus"].id,
            name: "Aventus",
            brand: "Creed",
            price: 495.0,
            quantity: 1,
            image: "/products/creed-aventus.svg",
          },
        ],
      },
    },
  });

  // Order 5: Elena Rodriguez (Paid, Shipped)
  const order5 = await prisma.order.create({
    data: {
      orderNumber: "LUM-985566",
      customerId: createdCustomers["elena.rodriguez@hotmail.com"].id,
      email: "elena.rodriguez@hotmail.com",
      name: "Elena Rodriguez",
      address: "456 Oak Avenue",
      city: "Miami",
      state: "FL",
      zip: "33101",
      country: "US",
      status: "shipped",
      paymentStatus: "paid",
      fulfillmentStatus: "fulfilled",
      subtotal: 735.0,
      shipping: 0.0,
      tax: 58.8,
      total: 793.8,
      shippingTracking: "9405500000000000000000",
      shippingProvider: "USPS",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      items: {
        create: [
          {
            productId: createdProducts["baccarat-rouge-540-edp"].id,
            name: "Baccarat Rouge 540",
            brand: "Maison Francis Kurkdjian",
            price: 325.0,
            quantity: 1,
            image: "/products/baccarat-rouge-540-edp.jpg",
          },
          {
            productId: createdProducts["parfums-de-marly-layton"].id,
            name: "Layton",
            brand: "Parfums de Marly",
            price: 400.0,
            quantity: 1,
            image: "/products/parfums-de-marly-layton.jpg",
          },
        ],
      },
    },
  });

  console.log("Seeded Orders.");

  // Update customer CLV & total spent based on orders
  const sophieOrders = [order1, order2];
  const sophieSpent = sophieOrders.reduce((sum, o) => sum + o.total, 0);
  await prisma.customer.update({
    where: { email: "sophie.dubois@gmail.com" },
    data: {
      totalSpent: sophieSpent,
      orderCount: sophieOrders.length,
      clv: sophieSpent,
      lastPurchaseAt: order2.createdAt,
    },
  });

  const jamesOrders = [order3];
  const jamesSpent = jamesOrders.reduce((sum, o) => sum + o.total, 0);
  await prisma.customer.update({
    where: { email: "james.smith@yahoo.com" },
    data: {
      totalSpent: jamesSpent,
      orderCount: jamesOrders.length,
      clv: jamesSpent,
      lastPurchaseAt: order3.createdAt,
    },
  });

  const elenaOrders = [order5]; // Only count non-refunded/active orders for Spent, but CLV can include historical total or net
  const elenaSpent = elenaOrders.reduce((sum, o) => sum + o.total, 0);
  await prisma.customer.update({
    where: { email: "elena.rodriguez@hotmail.com" },
    data: {
      totalSpent: elenaSpent,
      orderCount: 2, // 2 orders total
      clv: elenaSpent + order4.total, // CLV represents total historical value
      lastPurchaseAt: order5.createdAt,
    },
  });

  // 5. Create Carts
  // Sophie's Cart (Checked Out)
  await prisma.cart.create({
    data: {
      sessionId: "sess_sophie_cart_old",
      customerEmail: "sophie.dubois@gmail.com",
      items: JSON.stringify([{ productId: createdProducts["ysl-y-edp"].id, quantity: 1 }]),
      value: 165.0,
      isCheckedOut: true,
      createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  });

  // Abandoned Cart: Clara Vance
  await prisma.cart.create({
    data: {
      sessionId: "sess_clara_cart_abandoned",
      customerEmail: "clara.vance@gmail.com",
      items: JSON.stringify([
        { productId: createdProducts["dior-sauvage-edp"].id, quantity: 1 },
        { productId: createdProducts["tom-ford-ombre-leather"].id, quantity: 1 },
      ]),
      value: 405.0,
      isCheckedOut: false,
      emailSent: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  // Active Cart: Guest
  await prisma.cart.create({
    data: {
      sessionId: "sess_guest_active",
      items: JSON.stringify([{ productId: createdProducts["creed-aventus"].id, quantity: 1 }]),
      value: 495.0,
      isCheckedOut: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
      lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
    },
  });

  console.log("Seeded Carts.");

  // 6. Seed Browsing History (Activity)
  const history = [
    { customerEmail: "sophie.dubois@gmail.com", page: "/product/dior-sauvage-edp", duration: 45, device: "Desktop", browser: "Chrome" },
    { customerEmail: "sophie.dubois@gmail.com", page: "/cart", duration: 15, device: "Desktop", browser: "Chrome" },
    { customerEmail: "sophie.dubois@gmail.com", page: "/checkout", duration: 90, device: "Desktop", browser: "Chrome" },
    { customerEmail: "clara.vance@gmail.com", page: "/product/tom-ford-ombre-leather", duration: 120, device: "Mobile", browser: "Safari" },
    { customerEmail: "clara.vance@gmail.com", page: "/product/dior-sauvage-edp", duration: 60, device: "Mobile", browser: "Safari" },
    { customerEmail: "clara.vance@gmail.com", page: "/cart", duration: 30, device: "Mobile", browser: "Safari" },
    { customerEmail: "elena.rodriguez@hotmail.com", page: "/product/baccarat-rouge-540-edp", duration: 180, device: "Tablet", browser: "Firefox" },
  ];

  for (const h of history) {
    await prisma.browsingHistory.create({ data: h });
  }
  console.log("Seeded Browsing History.");

  // 7. Seed Campaigns & Discounts
  await prisma.discountCampaign.create({
    data: {
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
      active: true,
      usageCount: 15,
    },
  });

  await prisma.discountCampaign.create({
    data: {
      code: "LUXE50",
      type: "fixed",
      value: 50,
      expiration: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      active: true,
      usageCount: 8,
    },
  });

  await prisma.emailCampaign.create({
    data: {
      subject: "Unlock Your Luxury Scent Profile - 10% Off",
      content: "<h1>Welcome to Lumière Parfums</h1><p>Enjoy 10% off your next purchase using code <strong>WELCOME10</strong>.</p>",
      segmentId: "new",
      status: "sent",
      sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      openRate: 42.5,
      clickRate: 18.2,
      conversions: 3,
    },
  });

  await prisma.emailCampaign.create({
    data: {
      subject: "Exclusive VIP Autumn Fragrance Preview",
      content: "<h1>Autumn Niche Arrivals</h1><p>Dear VIP, explore our latest niche fragrances before anyone else.</p>",
      segmentId: "vip",
      status: "draft",
    },
  });

  console.log("Seeded Discount & Email Campaigns.");

  // 8. Seed Integrations Config
  await prisma.integrationConfig.create({
    data: {
      provider: "stripe",
      credentials: JSON.stringify({ apiKey: "sk_test_mock_stripe_key_lumiere_12345", webhookSecret: "whsec_mock_secret" }),
      enabled: true,
    },
  });

  await prisma.integrationConfig.create({
    data: {
      provider: "sendgrid",
      credentials: JSON.stringify({ apiKey: "SG.mock_sendgrid_key_lumiere_998877", fromEmail: "noreply@lumiere.com" }),
      enabled: false,
    },
  });

  await prisma.integrationConfig.create({
    data: {
      provider: "shippo",
      credentials: JSON.stringify({ apiKey: "shippo_test_mock_key_554433" }),
      enabled: true,
    },
  });

  console.log("Seeded Integrations.");

  // 9. Seed Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      userName: admin.name,
      action: "Staff Registered",
      details: "Default Admin account initialized during database seed.",
      ipAddress: "127.0.0.1",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      userName: admin.name,
      action: "Updated Stock Level",
      details: "Adjusted stock levels for Sauvage EDP to 45 units.",
      ipAddress: "127.0.0.1",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: manager.id,
      userName: manager.name,
      action: "Created Discount Campaign",
      details: "Created percentage discount WELCOME10.",
      ipAddress: "192.168.1.15",
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  });

  console.log("Seeded Audit Logs.");
  console.log("Database Seeding Completed Successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
