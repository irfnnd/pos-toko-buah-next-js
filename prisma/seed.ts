import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed for POS Toko Buah...");

  // Clear existing data
  await db.notification.deleteMany();
  await db.expense.deleteMany();
  await db.saleItem.deleteMany();
  await db.sale.deleteMany();
  await db.stockMovement.deleteMany();
  await db.stockBatch.deleteMany();
  await db.fruit.deleteMany();
  await db.supplier.deleteMany();
  await db.user.deleteMany();

  // 1. Create Users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await db.user.create({
    data: {
      name: "Budi Santoso (Admin)",
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const kasir = await db.user.create({
    data: {
      name: "Siti Rahma (Kasir)",
      username: "kasir",
      password: hashedPassword,
      role: "KASIR",
      status: "ACTIVE",
    },
  });

  console.log("✅ Users created: Admin (admin) & Kasir (kasir)");

  // 2. Create Suppliers
  const sup1 = await db.supplier.create({
    data: {
      code: "SUP-001",
      name: "PT Buah Segar Nusantara",
      phone: "0812-3456-7890",
      address: "Jl. Pasar Induk Kramat Jati No. 12, Jakarta East",
      note: "Distributor utama apel & jeruk impor",
      status: "ACTIVE",
    },
  });

  const sup2 = await db.supplier.create({
    data: {
      code: "SUP-002",
      name: "CV Fruit Jaya Lokal",
      phone: "0856-9876-5432",
      address: "Jl. Raya Ciwidey No. 45, Bandung",
      note: "Pemasok mangga, pisang, dan buah lokal",
      status: "ACTIVE",
    },
  });

  const sup3 = await db.supplier.create({
    data: {
      code: "SUP-003",
      name: "Toko Grosir Buah Utama",
      phone: "0821-1122-3344",
      address: "Jl. Kebon Jeruk No. 88, Jakarta West",
      note: "Pemasok semangka, melon, dan anggur",
      status: "ACTIVE",
    },
  });

  console.log("✅ Suppliers created: 3 suppliers");

  // 3. Create Fruits
  const fruitsData = [
    {
      code: "FRU-001",
      name: "Apel Fuji Super",
      unit: "Kg",
      defaultBuyPrice: 32000,
      sellPrice: 45000,
      currentStock: 45,
      minStock: 10,
      defaultShelfLifeDays: 14,
      status: "ACTIVE" as const,
    },
    {
      code: "FRU-002",
      name: "Jeruk Medan Manis",
      unit: "Kg",
      defaultBuyPrice: 22000,
      sellPrice: 32000,
      currentStock: 35,
      minStock: 10,
      defaultShelfLifeDays: 10,
      status: "ACTIVE" as const,
    },
    {
      code: "FRU-003",
      name: "Mangga Harum Manis",
      unit: "Kg",
      defaultBuyPrice: 25000,
      sellPrice: 38000,
      currentStock: 30,
      minStock: 8,
      defaultShelfLifeDays: 7,
      status: "ACTIVE" as const,
    },
    {
      code: "FRU-004",
      name: "Pisang Sunpride",
      unit: "Ikat",
      defaultBuyPrice: 18000,
      sellPrice: 25000,
      currentStock: 25,
      minStock: 5,
      defaultShelfLifeDays: 5,
      status: "ACTIVE" as const,
    },
    {
      code: "FRU-005",
      name: "Semangka Merah Tanpa Biji",
      unit: "Kg",
      defaultBuyPrice: 8000,
      sellPrice: 14000,
      currentStock: 60,
      minStock: 15,
      defaultShelfLifeDays: 12,
      status: "ACTIVE" as const,
    },
    {
      code: "FRU-006",
      name: "Melon Hijau Sweet",
      unit: "Kg",
      defaultBuyPrice: 12000,
      sellPrice: 20000,
      currentStock: 40,
      minStock: 10,
      defaultShelfLifeDays: 10,
      status: "ACTIVE" as const,
    },
    {
      code: "FRU-007",
      name: "Anggur Merah Import",
      unit: "Kg",
      defaultBuyPrice: 65000,
      sellPrice: 95000,
      currentStock: 15,
      minStock: 5,
      defaultShelfLifeDays: 14,
      status: "ACTIVE" as const,
    },
    {
      code: "FRU-008",
      name: "Naga Merah Super",
      unit: "Kg",
      defaultBuyPrice: 18000,
      sellPrice: 28000,
      currentStock: 20,
      minStock: 5,
      defaultShelfLifeDays: 8,
      status: "ACTIVE" as const,
    },
    {
      code: "FRU-009",
      name: "Alpukat Miki",
      unit: "Kg",
      defaultBuyPrice: 30000,
      sellPrice: 48000,
      currentStock: 4, // Low stock demo
      minStock: 10,
      defaultShelfLifeDays: 6,
      status: "ACTIVE" as const,
    },
    {
      code: "FRU-010",
      name: "Salak Pondoh Super",
      unit: "Kg",
      defaultBuyPrice: 12000,
      sellPrice: 20000,
      currentStock: 25,
      minStock: 5,
      defaultShelfLifeDays: 10,
      status: "ACTIVE" as const,
    },
  ];

  const createdFruits: Record<string, any> = {};
  for (const f of fruitsData) {
    const fruit = await db.fruit.create({ data: f });
    createdFruits[f.code] = fruit;
  }
  console.log("✅ Fruits created: 10 fruits");

  // 4. Create Stock Batches (demonstrating FEFO and status: AMAN, SEGERA_BATAS, MELEWATI_BATAS)
  const today = new Date();
  const daysAgo = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d;
  };
  const daysFuture = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d;
  };

  // Batches for Apel Fuji
  const batchApel1 = await db.stockBatch.create({
    data: {
      batchNumber: "BATCH-APEL-001",
      fruitId: createdFruits["FRU-001"].id,
      supplierId: sup1.id,
      receiveDate: daysAgo(2),
      initialQuantity: 25,
      currentQuantity: 25,
      unit: "Kg",
      buyPrice: 32000,
      shelfLifeDays: 14,
      expiryDate: daysFuture(12),
      status: "AMAN",
      note: "Batch apel segar masuk 2 hari lalu",
    },
  });

  const batchApel2 = await db.stockBatch.create({
    data: {
      batchNumber: "BATCH-APEL-002",
      fruitId: createdFruits["FRU-001"].id,
      supplierId: sup1.id,
      receiveDate: daysAgo(12),
      initialQuantity: 20,
      currentQuantity: 20,
      unit: "Kg",
      buyPrice: 30000,
      shelfLifeDays: 14,
      expiryDate: daysFuture(2), // Expires in 2 days -> SEGERA_BATAS
      status: "SEGERA_BATAS",
      note: "Mendekati masa simpan (2 hari lagi)",
    },
  });

  // Batches for Jeruk Medan
  const batchJeruk1 = await db.stockBatch.create({
    data: {
      batchNumber: "BATCH-JRK-001",
      fruitId: createdFruits["FRU-002"].id,
      supplierId: sup1.id,
      receiveDate: daysAgo(3),
      initialQuantity: 35,
      currentQuantity: 35,
      unit: "Kg",
      buyPrice: 22000,
      shelfLifeDays: 10,
      expiryDate: daysFuture(7),
      status: "AMAN",
    },
  });

  // Batches for Mangga Harum Manis (Including an EXPIRED batch for testing)
  const batchMangga1 = await db.stockBatch.create({
    data: {
      batchNumber: "BATCH-MGG-001",
      fruitId: createdFruits["FRU-003"].id,
      supplierId: sup2.id,
      receiveDate: daysAgo(10),
      initialQuantity: 15,
      currentQuantity: 10,
      unit: "Kg",
      buyPrice: 25000,
      shelfLifeDays: 7,
      expiryDate: daysAgo(3), // Expired 3 days ago -> MELEWATI_BATAS
      status: "MELEWATI_BATAS",
      note: "Sudah melewati batas masa simpan 3 hari",
    },
  });

  const batchMangga2 = await db.stockBatch.create({
    data: {
      batchNumber: "BATCH-MGG-002",
      fruitId: createdFruits["FRU-003"].id,
      supplierId: sup2.id,
      receiveDate: daysAgo(1),
      initialQuantity: 20,
      currentQuantity: 20,
      unit: "Kg",
      buyPrice: 25000,
      shelfLifeDays: 7,
      expiryDate: daysFuture(6),
      status: "AMAN",
    },
  });

  // Batches for Pisang
  await db.stockBatch.create({
    data: {
      batchNumber: "BATCH-PSG-001",
      fruitId: createdFruits["FRU-004"].id,
      supplierId: sup2.id,
      receiveDate: daysAgo(4),
      initialQuantity: 25,
      currentQuantity: 25,
      unit: "Ikat",
      buyPrice: 18000,
      shelfLifeDays: 5,
      expiryDate: daysFuture(1), // Expires tomorrow -> SEGERA_BATAS
      status: "SEGERA_BATAS",
    },
  });

  // Batches for Semangka
  await db.stockBatch.create({
    data: {
      batchNumber: "BATCH-SMK-001",
      fruitId: createdFruits["FRU-005"].id,
      supplierId: sup3.id,
      receiveDate: daysAgo(2),
      initialQuantity: 60,
      currentQuantity: 60,
      unit: "Kg",
      buyPrice: 8000,
      shelfLifeDays: 12,
      expiryDate: daysFuture(10),
      status: "AMAN",
    },
  });

  // Batches for Alpukat (Low Stock)
  await db.stockBatch.create({
    data: {
      batchNumber: "BATCH-ALP-001",
      fruitId: createdFruits["FRU-009"].id,
      supplierId: sup2.id,
      receiveDate: daysAgo(2),
      initialQuantity: 4,
      currentQuantity: 4,
      unit: "Kg",
      buyPrice: 30000,
      shelfLifeDays: 6,
      expiryDate: daysFuture(4),
      status: "AMAN",
    },
  });

  console.log("✅ Stock batches created with AMAN, SEGERA_BATAS, & MELEWATI_BATAS statuses");

  // 5. Create Sample Transactions (Sales)
  const sale1 = await db.sale.create({
    data: {
      invoiceNo: "INV-20260918-001",
      saleDate: today,
      cashierId: kasir.id,
      totalAmount: 135000,
      paidAmount: 150000,
      changeAmount: 15000,
      paymentMethod: "CASH",
      status: "COMPLETED",
      items: {
        create: [
          {
            fruitId: createdFruits["FRU-001"].id,
            stockBatchId: batchApel2.id, // Sold from batch 2
            quantity: 2,
            sellPrice: 45000,
            buyPrice: 30000,
            subtotal: 90000,
            costTotal: 60000,
            profit: 30000,
          },
          {
            fruitId: createdFruits["FRU-002"].id,
            stockBatchId: batchJeruk1.id,
            quantity: 1.40625, // ~45,000 IDR worth
            sellPrice: 32000,
            buyPrice: 22000,
            subtotal: 45000,
            costTotal: 30937.5,
            profit: 14062.5,
          },
        ],
      },
    },
  });

  console.log("✅ Sample Sale transaction created:", sale1.invoiceNo);

  // 6. Create Notifications
  await db.notification.createMany({
    data: [
      {
        type: "EXPIRY_WARNING",
        title: "Peringatan Masa Simpan",
        message: "Apel Fuji (Batch BATCH-APEL-002) akan melewati masa simpan dalam 2 hari.",
        isRead: false,
        link: "/stok",
      },
      {
        type: "EXPIRED",
        title: "Buah Melewati Masa Simpan",
        message: "Mangga Harum Manis (Batch BATCH-MGG-001) telah melewati batas masa simpan!",
        isRead: false,
        link: "/stok",
      },
      {
        type: "LOW_STOCK",
        title: "Stok Menipis",
        message: "Stok Alpukat Miki tersisa 4 Kg (di bawah minimum stok 10 Kg).",
        isRead: false,
        link: "/stok",
      },
    ],
  });

  console.log("✅ Initial notifications created");
  console.log("🎉 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
