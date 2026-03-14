import { prisma } from "../prisma/client";

async function checkData() {
  const userCount = await prisma.user.count();
  const warehouseCount = await prisma.warehouse.count();
  const productCount = await prisma.product.count();
  const stockCount = await prisma.stock.count();

  console.log(`Users: ${userCount}`);
  console.log(`Warehouses: ${warehouseCount}`);
  console.log(`Products: ${productCount}`);
  console.log(`Stocks: ${stockCount}`);

  if (userCount > 0) {
    const user = await prisma.user.findFirst();
    console.log(`Sample User: ${user?.email} (${user?.id})`);
  }
  if (warehouseCount > 0) {
    const warehouse = await prisma.warehouse.findFirst();
    console.log(`Sample Warehouse: ${warehouse?.name} (${warehouse?.id})`);
  }
  if (productCount > 0) {
    const product = await prisma.product.findFirst();
    console.log(`Sample Product: ${product?.name} (${product?.id})`);
  }

  await prisma.$disconnect();
}

checkData();
