const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productCode: String,
  productName: String,
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  unitCost: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
});

const saleSchema = new mongoose.Schema({
  saleNumber: { 
    type: String, 
    default: function() {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      return `FAC-${year}-${random}`;
    }
  },
  series: { type: String, default: 'FAC' },
  correlative: { type: Number, default: 0 },
  documentType: { type: String, enum: ['boleta', 'factura', 'ticket'], default: 'boleta' },
  saleDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  customer: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerCode: String,
    businessName: String,
    documentNumber: String
  },
  seller: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    code: String
  },
  items: [itemSchema],
  summary: {
    subtotal: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  payment: {
    method: { type: String, default: 'cash' },
    amountReceived: { type: Number, default: 0 },
    change: { type: Number, default: 0 }
  },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Método para calcular totales
saleSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  
  this.items.forEach(item => {
    const itemTotal = item.unitPrice * item.quantity;
    item.subtotal = itemTotal / 1.18;
    item.tax = itemTotal - item.subtotal;
    item.total = itemTotal;
    subtotal += item.subtotal;
  });

  this.summary.subtotal = subtotal;
  this.summary.taxAmount = subtotal * 0.18;
  this.summary.total = subtotal + this.summary.taxAmount;
};

module.exports = mongoose.model('Sale', saleSchema);
