const mongoose = require('mongoose');

const inventoryMovementSchema = new mongoose.Schema({
  movementNumber: { 
    type: String, 
    default: function() {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      return `MOV-${year}-${random}`;
    }
  },
  movementType: { 
    type: String, 
    enum: ['purchase', 'sale', 'adjustment_positive', 'adjustment_negative', 'return'], 
    required: true 
  },
  movementTypeName: String,
  movementDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed'], default: 'completed' },
  product: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productCode: String,
    productName: String,
    barcode: String
  },
  quantity: { type: Number, required: true, min: 0 },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  unitCost: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  reason: String,
  notes: String,
  reference: {
    documentType: String,
    documentNumber: String
  },
  responsible: {
    id: mongoose.Schema.Types.ObjectId,
    name: String
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Índice para búsquedas
inventoryMovementSchema.index({ 'product.id': 1, movementDate: -1 });

module.exports = mongoose.model('InventoryMovement', inventoryMovementSchema);
