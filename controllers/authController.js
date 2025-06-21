const { Merchant } = require('../models');
const jwt = require('jsonwebtoken');

class AuthController {
  async signup(req, res) {
    try {
      const { name, email, password, businessName, businessType } = req.body;
      console.log('Signup attempt for:', email);

      // Check if merchant already exists
      const existingMerchant = await Merchant.findOne({ where: { email } });
      if (existingMerchant) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create new merchant
      const merchant = await Merchant.create({
        name,
        email,
        password,
        businessName,
        businessType
      });
      console.log('Merchant created successfully:', merchant.id);

      // Check if JWT_SECRET exists
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set in environment variables!');
        throw new Error('JWT_SECRET not configured');
      }

      // Generate token
      const token = jwt.sign(
        { id: merchant.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      console.log('Token generated successfully');

      // Remove password from response
      const merchantData = merchant.toJSON();
      console.log('Merchant data prepared for response');

      res.status(201).json({
        success: true,
        token,
        merchant: merchantData
      });
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        error: 'Failed to create account',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log('Login attempt for:', email);

      // Find merchant
      const merchant = await Merchant.findOne({ where: { email } });
      if (!merchant) {
        console.log('Merchant not found:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      console.log('Merchant found:', merchant.id);

      // Validate password
      const isValidPassword = await merchant.validatePassword(password);
      if (!isValidPassword) {
        console.log('Invalid password for:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      console.log('Password validated successfully');

      // Check if JWT_SECRET exists
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set in environment variables!');
        throw new Error('JWT_SECRET not configured');
      }

      // Generate token
      const token = jwt.sign(
        { id: merchant.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      console.log('Token generated successfully');

      // Remove password from response
      const merchantData = merchant.toJSON();

      res.json({
        success: true,
        token,
        merchant: merchantData
      });
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', error.message);
      res.status(500).json({ error: 'Failed to login' });
    }
  }

  async getProfile(req, res) {
    try {
      const merchant = await Merchant.findByPk(req.merchant.id, {
        attributes: { exclude: ['password'] }
      });

      res.json({
        success: true,
        merchant
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, businessName, businessType, industry } = req.body;
      
      await req.merchant.update({
        name,
        businessName,
        businessType,
        industry
      });

      const merchantData = req.merchant.toJSON();
      delete merchantData.password;

      res.json({
        success: true,
        merchant: merchantData
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}

module.exports = new AuthController();