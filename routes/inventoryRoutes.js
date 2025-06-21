const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authenticate = require('../middleware/auth');
const { validateInventoryGeneration } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

router.post('/generate', validateInventoryGeneration, inventoryController.generateInventory);
router.post('/customize', inventoryController.customizePattern);
router.get('/list', inventoryController.getInventories);
router.put('/:inventoryId', inventoryController.updateInventory);
router.get('/patterns', inventoryController.getUserPatterns);

module.exports = router;