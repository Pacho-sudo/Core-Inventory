import { prisma } from "../prisma/client";

async function seedTestData() {
  console.log("🌱 Seeding test data...");

  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("❌ No user found. Please register first.");
    return;
  }

  // 1. Create Category
  const category = await prisma.productCategory.create({
    data: {
      name: "Office Furniture",
      userId: user.id,
      createdBy: user.id,
    }
  });

  // 2. Create Supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: "IKEA",
      userId: user.id,
      createdBy: user.id,
    }
  });

  // 3. Create Warehouse
  const warehouse = await prisma.warehouse.create({
    data: {
      name: "Main Warehouse",
      code: "WH-001",
      location: "New York",
      userId: user.id,
      createdBy: user.id,
    }
  });

  // 4. Create Product
  const product = await prisma.product.create({
    data: {
      name: "Office Chair",
      sku: "CHAIR-001",
      price: 150,
      quantity: BigInt(50),
      status: "active",
      categoryId: category.id,
      supplierId: supplier.id,
      userId: user.id,
      createdBy: user.id,
    }
  });

  // 5. Create Stock link
  await prisma.stock.create({
    data: {
      productId: product.id,
      warehouseId: warehouse.id,
      quantity: 50,
      userId: user.id,
    }
  });

  console.log("✅ Seed complete.");
  await prisma.$disconnect();
}

seedTestData();
