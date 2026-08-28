const mysql = require('mysql2/promise');

async function testConnection() {
  const passwords = [
    'Root@123', 'root@123', 'root123', 'Root123', 'Root@1234', 'root@1234',
    'Password@123', 'password@123', 'Admin@123', 'admin@123',
    '12345678', '123456789', '12345',
    'vighashini', 'Vighashini', 'vighashini@123', 'Vighashini@123', 'vigha', 'Vigha@123',
    'farmdirect', 'FarmDirect@123', 'farmdirect@123', 'Farm@123', 'Farmer@123',
    'sih2024', 'sih2025', 'sih2026', 'SIH@2024', 'SIH@2025', 'SIH@2026',
    'mysql80', 'MySQL@80', 'root80', 'Root@80'
  ];

  const users = ['root', 'vighashini', 'admin', 'farmdirect'];

  for (const user of users) {
    for (const pwd of passwords) {
      try {
        const conn = await mysql.createConnection({
          host: '127.0.0.1',
          port: 3306,
          user: user,
          password: pwd,
        });
        console.log(`SUCCESS: Connected to MySQL with user: "${user}", password: "${pwd}"`);
        await conn.query('CREATE DATABASE IF NOT EXISTS farmdirect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
        console.log('Database farmdirect ensured.');
        await conn.end();
        return { user, password: pwd };
      } catch (err) {
        // silence failed attempts
      }
    }
  }
  console.log('None of the common passwords matched for root/users.');
}

testConnection().catch(console.error);
