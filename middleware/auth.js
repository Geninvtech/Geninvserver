const jwt = require('jsonwebtoken');
const { Merchant } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const merchant = await Merchant.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!merchant) {
      throw new Error();
    }

    req.merchant = merchant;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = authenticate;