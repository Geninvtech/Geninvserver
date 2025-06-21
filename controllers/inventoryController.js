const { Inventory, UserPattern, Pattern } = require('../models');
const patternService = require('../services/patternService');
const openaiService = require('../services/openaiService');

class InventoryController {
  async generateInventory(req, res) {
    try {
      const { businessDescription, useExisting = true } = req.body;
      const merchantId = req.merchant.id;

      // Step 1: Get or create pattern
      const pattern = await patternService.getOrCreatePattern(businessDescription);

      // Step 2: Create user pattern
      const userPattern = await patternService.createUserPattern(merchantId, pattern.id, {
        name: `${businessDescription} Inventory`
      });

      // Step 3: Create initial inventory
      const inventory = await Inventory.create({
        merchantId,
        userPatternId: userPattern.id,
        items: pattern.structure.categories.flatMap(category => 
          category.items.map(item => ({
            ...item,
            category: category.name,
            quantity: 0,
            currentValue: 0
          }))
        )
      });

      res.json({
        success: true,
        pattern: {
          id: pattern.id,
          businessType: pattern.businessType,
          industry: pattern.industry,
          structure: pattern.structure,
          isNew: pattern.usageCount === 1
        },
        userPattern: {
          id: userPattern.id,
          customStructure: userPattern.customStructure
        },
        inventory: inventory
      });
    } catch (error) {
      console.error('Generate inventory error:', error);
      res.status(500).json({ error: 'Failed to generate inventory' });
    }
  }

  async customizePattern(req, res) {
    try {
      const { userPatternId, modifications, requirements } = req.body;

      let updatedPattern;
      
      if (requirements) {
        // Use OpenAI to enhance pattern based on requirements
        const userPattern = await UserPattern.findByPk(userPatternId);
        const enhanced = await openaiService.enhanceInventoryPattern(
          userPattern.customStructure,
          requirements
        );
        updatedPattern = await patternService.updateUserPattern(userPatternId, enhanced);
      } else {
        // Direct modifications
        updatedPattern = await patternService.updateUserPattern(userPatternId, modifications);
      }

      res.json({
        success: true,
        userPattern: updatedPattern
      });
    } catch (error) {
      console.error('Customize pattern error:', error);
      res.status(500).json({ error: 'Failed to customize pattern' });
    }
  }

  async getInventories(req, res) {
    try {
      const inventories = await Inventory.findAll({
        where: { merchantId: req.merchant.id },
        include: [{
          model: UserPattern,
          as: 'userPattern',
          include: [{
            model: Pattern,
            as: 'pattern'
          }]
        }],
        order: [['updatedAt', 'DESC']]
      });

      res.json({
        success: true,
        inventories
      });
    } catch (error) {
      console.error('Get inventories error:', error);
      res.status(500).json({ error: 'Failed to fetch inventories' });
    }
  }

  async updateInventory(req, res) {
    try {
      const { inventoryId } = req.params;
      const { items } = req.body;

      const inventory = await Inventory.findOne({
        where: {
          id: inventoryId,
          merchantId: req.merchant.id
        }
      });

      if (!inventory) {
        return res.status(404).json({ error: 'Inventory not found' });
      }

      // Calculate totals
      const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalValue = items.reduce((sum, item) => 
        sum + ((item.quantity || 0) * (item.estimatedPrice || 0)), 0
      );

      await inventory.update({
        items,
        totalItems,
        totalValue,
        lastUpdated: new Date()
      });

      res.json({
        success: true,
        inventory
      });
    } catch (error) {
      console.error('Update inventory error:', error);
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  }

  async getUserPatterns(req, res) {
    try {
      const userPatterns = await UserPattern.findAll({
        where: {
          merchantId: req.merchant.id,
          isActive: true
        },
        include: [{
          model: Pattern,
          as: 'pattern'
        }],
        order: [['lastUsed', 'DESC']]
      });

      res.json({
        success: true,
        userPatterns
      });
    } catch (error) {
      console.error('Get user patterns error:', error);
      res.status(500).json({ error: 'Failed to fetch patterns' });
    }
  }
}

module.exports = new InventoryController();