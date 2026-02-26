const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');

exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(parseInt(limit)).lean(),
      Product.countDocuments(query)
    ]);
    res.status(200).json({ success: true, data: products, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'No encontrado' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.adjustInventory = async (req, res) => {
  try {
    const { quantity, type, reason } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    const previousStock = product.inventory.current;
    product.inventory.current = type === 'entrada' ? previousStock + quantity : Math.max(0, previousStock - quantity);
    product.inventory.available = product.inventory.current;
    await product.save();

    const movement = new InventoryMovement({
      movementType: type === 'entrada' ? 'purchase' : 'adjustment',
      movementTypeName: type === 'entrada' ? 'Entrada' : 'Ajuste',
      product: { id: product._id, productCode: product.productCode, productName: product.name },
      quantity,
      previousStock,
      newStock: product.inventory.current,
      reason,
      createdBy: req.user.id
    });
    await movement.save();

    res.status(200).json({ success: true, data: { product, movement } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ $expr: { $lte: ['$inventory.current', '$inventory.minimum'] } }).lean();
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};