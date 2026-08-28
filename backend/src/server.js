require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

// FarmDirect API Server
app.listen(PORT, () => {
  console.log('=============================================');
  console.log('🌱 FarmDirect Backend running on port ' + PORT);
  console.log('📦 Environment: ' + (process.env.NODE_ENV || 'development'));
  console.log('🔗 API Root: http://localhost:' + PORT + '/api');
  console.log('🩺 API Health: http://localhost:' + PORT + '/api/health');
  console.log('=============================================');
});
