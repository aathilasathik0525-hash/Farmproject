const prisma = require('../config/database');

async function migrate() {
  const tables = [
    { table: 'User', col: 'preferredLanguage', def: 'TEXT DEFAULT "ta-IN"' },
    { table: 'FarmerProfile', col: 'preferredLanguage', def: 'TEXT DEFAULT "ta-IN"' },
    { table: 'Notification', col: 'language', def: 'TEXT DEFAULT "ta-IN"' },
  ];

  for (const item of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE ${item.table} ADD COLUMN ${item.col} ${item.def};`);
      console.log(`Added column ${item.col} to ${item.table}`);
    } catch (err) {
      console.log(`Column ${item.col} on ${item.table}:`, err.message);
    }
  }

  const userCount = await prisma.user.count();
  const farmerCount = await prisma.farmerProfile.count();
  const productCount = await prisma.product.count();
  console.log(`Current DB records: ${userCount} users, ${farmerCount} farmers, ${productCount} products.`);
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
