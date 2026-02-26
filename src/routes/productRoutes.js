const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

router.get('/', auth, productController.getAllProducts);
router.get('/low-stock', auth, productController.getLowStockProducts);
router.get('/:id', auth, productController.getProductById);
router.post('/', auth, productController.createProduct);
router.put('/:id', auth, productController.updateProduct);
router.post('/:id/adjust', auth, productController.adjustInventory);

module.exports = router;