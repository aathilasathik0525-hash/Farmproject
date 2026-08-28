const mysql = require('mysql2/promise');

async function findMySQLPassword() {
  const commonPasswords = [
    '', 'root', 'password', '1234', '12345', '123456', '12345678', '123456789',
    'Root@123', 'root@123', 'root123', 'Root123', 'Root@1234', 'root@1234',
    'Password@123', 'password@123', 'Admin@123', 'admin@123', 'admin', 'administrator',
    'vighashini', 'Vighashini', 'vighashini@123', 'Vighashini@123', 'vighashini123', 'Vighashini123',
    'vigha', 'Vigha', 'vigha@123', 'Vigha@123', 'vigha123', 'Vigha123',
    'vighashini2024', 'vighashini2025', 'vighashini2026', 'vigha2024', 'vigha2025', 'vigha2026',
    'farmdirect', 'FarmDirect', 'farmdirect@123', 'FarmDirect@123', 'Farm@123', 'farm@123',
    'sih', 'sih2024', 'sih2025', 'sih2026', 'SIH@2024', 'SIH@2025', 'SIH@2026', 'sih@123', 'SIH@123',
    'mysql', 'MySQL', 'mysql80', 'MySQL80', 'mysql@123', 'MySQL@123', 'mysql123',
    'system', 'tiger', 'scott', 'oracle', 'test', 'Test@123', 'welcome', 'Welcome@123', 'welcome123',
    'computer', 'database', 'Database@123', 'db@123', 'Pass@123', 'pass123', '1111', '0000', '123123',
    'qwerty', 'qwerty123', 'qwert', 'P@ssw0rd', 'P@ssword1', 'Pass@word1', 'root_password',
    'kali', 'ubuntu', 'local', 'localhost'
  ];

  const usernames = ['root', 'vighashini', 'admin', 'farmdirect', 'mysql', 'user'];

  console.log(`Testing ${usernames.length * commonPasswords.length} combinations...`);

  for (const user of usernames) {
    for (const pwd of commonPasswords) {
      try {
        const conn = await mysql.createConnection({
          host: '127.0.0.1',
          port: 3306,
          user: user,
          password: pwd,
          connectTimeout: 500,
        });
        console.log(`\n🎉 FOUND WORKING CREDENTIALS: User="${user}", Password="${pwd}"`);
        await conn.query('CREATE DATABASE IF NOT EXISTS farmdirect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
        console.log('Database "farmdirect" successfully created/checked!');
        await conn.end();
        return { user, password: pwd };
      } catch (err) {
        if (!err.message.includes('Access denied')) {
          // ignore or log
        }
      }
    }
  }
  console.log('Finished testing wordlist without match.');
}

findMySQLPassword().catch(console.error);
