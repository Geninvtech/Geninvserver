const { Pattern, UserPattern } = require('../models');
const openaiService = require('./openaiService');
const { Op } = require('sequelize');

class PatternService {
  async findMatchingPattern(businessDescription) {
    try {
      // Extract keywords from business description
      const keywords = businessDescription.toLowerCase().split(' ');
      
      // Search for patterns matching keywords or business type
      const patterns = await Pattern.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            {
              businessType: {
                [Op.iLike]: `%${businessDescription}%`
              }
            },
            {
              keywords: {
                [Op.overlap]: keywords
              }
            },
            {
              industry: {
                [Op.iLike]: `%${businessDescription}%`
              }
            }
          ]
        },
        order: [['usageCount', 'DESC']],
        limit: 1
      });

      return patterns.length > 0 ? patterns[0] : null;
    } catch (error) {
      console.error('Pattern search error:', error);
      return null;
    }
  }

  async createPattern(businessDescription) {
    try {
      // Generate pattern using OpenAI
      const generatedPattern = await openaiService.generateInventoryPattern(businessDescription);
      
      // Create pattern in database
      const pattern = await Pattern.create({
        businessType: generatedPattern.businessType,
        industry: generatedPattern.industry,
        structure: generatedPattern.structure,
        keywords: generatedPattern.keywords,
        metadata: {
          generatedFor: businessDescription,
          generatedAt: new Date()
        }
      });

      return pattern;
    } catch (error) {
      console.error('Pattern creation error:', error);
      throw error;
    }
  }

  async getOrCreatePattern(businessDescription) {
    // First, try to find existing pattern
    let pattern = await this.findMatchingPattern(businessDescription);
    
    if (!pattern) {
      // If no pattern found, create new one using OpenAI
      pattern = await this.createPattern(businessDescription);
    } else {
      // Increment usage count
      await pattern.increment('usageCount');
    }

    return pattern;
  }

  async createUserPattern(merchantId, patternId, customizations = {}) {
    try {
      const pattern = await Pattern.findByPk(patternId);
      if (!pattern) {
        throw new Error('Pattern not found');
      }

      // Merge pattern structure with customizations
      const customStructure = {
        ...pattern.structure,
        ...customizations
      };

      const userPattern = await UserPattern.create({
        merchantId,
        patternId,
        customStructure,
        modifications: customizations,
        name: customizations.name || `${pattern.businessType} Inventory`
      });

      return userPattern;
    } catch (error) {
      console.error('User pattern creation error:', error);
      throw error;
    }
  }

  async updateUserPattern(userPatternId, modifications) {
    try {
      const userPattern = await UserPattern.findByPk(userPatternId, {
        include: ['pattern']
      });

      if (!userPattern) {
        throw new Error('User pattern not found');
      }

      // Merge existing structure with new modifications
      const updatedStructure = {
        ...userPattern.customStructure,
        ...modifications
      };

      await userPattern.update({
        customStructure: updatedStructure,
        modifications: {
          ...userPattern.modifications,
          ...modifications,
          lastModified: new Date()
        },
        lastUsed: new Date()
      });

      return userPattern;
    } catch (error) {
      console.error('User pattern update error:', error);
      throw error;
    }
  }
}

module.exports = new PatternService();