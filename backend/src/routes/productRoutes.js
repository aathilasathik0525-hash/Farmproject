const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { authenticate, authorize, ownsProduct } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

router.post(
  '/',
  authenticate,
  authorize('FARMER', 'ADMIN'),
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('farmerPrice').isNumeric().withMessage('Farmer price must be a valid number'),
    body('quantity').isNumeric().withMessage('Available quantity must be a valid number'),
  ],
  createProduct
);

router.put('/:id', authenticate, ownsProduct, updateProduct);
router.delete('/:id', authenticate, ownsProduct, deleteProduct);

module.exports = router;
