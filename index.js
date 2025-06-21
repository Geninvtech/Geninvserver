// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const { sequelize } = require('./models');
// const authRoutes = require('./routes/authRoutes');
// const inventoryRoutes = require('./routes/inventoryRoutes');

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/inventory', inventoryRoutes);

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date() });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     error: err.message || 'Internal server error'
//   });
// });

// // Database sync and server start
// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     // Test database connection
//     await sequelize.authenticate();
//     console.log('Database connection established successfully.');

//     // Sync database (use migrations in production)
//     if (process.env.NODE_ENV !== 'production') {
//       await sequelize.sync({ alter: true });
//       console.log('Database synchronized.');
//     }

//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error('Unable to start server:', error);
//     process.exit(1);
//   }
// };

// startServer();


const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('Environment check:');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Database sync and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database (use migrations in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Syncing database models...');
      await sequelize.sync({ alter: true });
      console.log('Database synchronized successfully.');
      
      // Log created tables
      const tables = await sequelize.getQueryInterface().showAllTables();
      console.log('Created tables:', tables);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`CORS enabled for: http://localhost:5173`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

startServer();