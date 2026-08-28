const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function verify() {
  console.log('1. Checking http://localhost:5000/api/health ...');
  const health = await get('http://localhost:5000/api/health');
  console.log('   Status:', health.status);
  console.log('   Response:', JSON.stringify(health.data));

  console.log('\n2. Checking http://localhost:5000/api/farmers ...');
  const farmersRes = await get('http://localhost:5000/api/farmers');
  console.log('   Status:', farmersRes.status);
  console.log('   Total Farmers Found in DB:', farmersRes.data?.count);
  const farmers = farmersRes.data?.data || [];

  if (farmers.length === 0) {
    console.error('   ❌ No farmers returned!');
    return;
  }

  for (let i = 0; i < Math.min(2, farmers.length); i++) {
    const f = farmers[i];
    console.log(`\n------------------------------------------------------------`);
    console.log(`Farmer #${i + 1}: ${f.name}`);
    console.log(`Farmer ID: ${f.id}`);
    console.log(`Location: ${f.village}, ${f.district}, ${f.state}`);
    console.log(`Language: ${f.preferredLanguage}`);
    console.log(`Available Active Crops Count: ${f.activeProductsCount}`);

    console.log(`\n3. Checking http://localhost:5000/api/farmers/${f.id} ...`);
    const details = await get(`http://localhost:5000/api/farmers/${f.id}`);
    const farmerData = details.data?.data?.farmer;
    const products = details.data?.data?.products || [];

    console.log(`   Farmer Name in Detail API: ${farmerData?.name}`);
    console.log(`   Total Products Returned: ${products.length}`);
    products.forEach((p) => {
      const match = p.farmerId === f.id;
      console.log(`   - Crop: ${p.name} | farmerId: ${p.farmerId} | Matches: ${match ? 'YES' : 'NO'} | Price: ₹${p.farmerPrice}/${p.unit} | Stock: ${p.availableStock} ${p.unit}`);
    });

    const allMatch = products.every((p) => p.farmerId === f.id);
    console.log(`   >>> Strict Farmer Product Isolation Result: ${allMatch ? 'PASS ✅' : 'FAIL ❌'}`);
  }
}

verify().catch((err) => {
  console.error('Error connecting to backend on port 5000:', err.message);
});
