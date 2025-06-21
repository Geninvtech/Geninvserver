const openai = require('../config/openai');

class OpenAIService {
  async generateInventoryPattern(businessDescription) {
    try {
      const prompt = `Generate a comprehensive inventory structure for a ${businessDescription} business. 
      Return a JSON structure with the following format:
      {
        "businessType": "specific business type",
        "industry": "industry category",
        "keywords": ["keyword1", "keyword2", ...],
        "categories": [
          {
            "name": "Category Name",
            "description": "Category description",
            "items": [
              {
                "name": "Item Name",
                "description": "Item description",
                "unit": "unit of measurement",
                "suggestedQuantity": number,
                "estimatedPrice": number,
                "reorderLevel": number,
                "sku": "suggested SKU format"
              }
            ]
          }
        ]
      }
      
      Be comprehensive and include all typical inventory items for this business type.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in business inventory management. Generate detailed, practical inventory structures.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      // Transform to match our pattern structure
      return {
        businessType: result.businessType,
        industry: result.industry,
        keywords: result.keywords,
        structure: {
          categories: result.categories
        }
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate inventory pattern');
    }
  }

  async enhanceInventoryPattern(pattern, userRequirements) {
    try {
      const prompt = `Enhance the following inventory pattern based on user requirements:
      
      Current Pattern: ${JSON.stringify(pattern)}
      User Requirements: ${userRequirements}
      
      Return an enhanced JSON structure maintaining the same format but with improvements based on the requirements.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in customizing business inventory structures.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to enhance inventory pattern');
    }
  }
}

module.exports = new OpenAIService();