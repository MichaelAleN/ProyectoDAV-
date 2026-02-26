const Sale = require('../models/Sale');
const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');

exports.getAllSales = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [sales, total] = await Promise.all([
      Sale.find().skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }).lean(),
      Sale.countDocuments()
    ]);
    res.status(200).json({ success: true, data: sales, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: 'No encontrada' });
    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createSale = async (req, res) => {
  try {
    const { items, customer, payment, notes } = req.body;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.inventory.available < item.quantity) {
        return res.status(400).json({ success: false, message: `Stock insuficiente para ${product?.name || item.productId}` });
      }
    }

    const sale = new Sale({ items, customer, payment, notes, seller: { id: req.user.id, name: req.user.fullName }, createdBy: req.user.id });
    sale.calculateTotals();
    await sale.save();

    for (const item of sale.items) {
      const product = await Product.findById(item.productId);
      const previousStock = product.inventory.current;
      product.inventory.current -= item.quantity;
      product.inventory.available = product.inventory.current;
      await product.save();

      const movement = new InventoryMovement({
        movementType: 'sale',
        movementTypeName: 'Venta',
        product: { id: product._id, productCode: product.productCode, productName: product.name },
        quantity: item.quantity,
        previousStock,
        newStock: product.inventory.current,
        createdBy: req.user.id
      });
      await movement.save();
    }

    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.cancelSale = async (req, res) => {
  try {
    const { reason } = req.body;
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    if (sale.status === 'cancelled') return res.status(400).json({ success: false, message: 'Ya está anulada' });

    for (const item of sale.items) {
      const product = await Product.findById(item.productId);
      const previousStock = product.inventory.current;
      product.inventory.current += item.quantity;
      product.inventory.available = product.inventory.current;
      await product.save();

      const movement = new InventoryMovement({
        movementType: 'adjustment',
        movementTypeName: 'Anulación de Venta',
        product: { id: product._id, productCode: product.productCode, productName: product.name },
        quantity: item.quantity,
        previousStock,
        newStock: product.inventory.current,
        reason: `Anulación: ${reason}`,
        createdBy: req.user.id
      });
      await movement.save();
    }

    sale.status = 'cancelled';
    await sale.save();
    res.status(200).json({ success: true, data: sale });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { status: { $ne: 'cancelled' }, saleDate: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    const report = await Sale.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } }, totalSales: { $sum: '$summary.total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const summary = await Sale.aggregate([{ $match: match }, { $group: { _id: null, totalSales: { $sum: '$summary.total' }, totalTransactions: { $sum: 1 } } }]);
    res.status(200).json({ success: true, data: { details: report, summary: summary[0] || {} } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};