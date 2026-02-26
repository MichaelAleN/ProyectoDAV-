const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCode: { 
    type: String, 
    default: function() {
      return `PROD-${Date.now().toString(36).toUpperCase()}`;
    }
  },
  barcode: { type: String, default: '' },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'general' },
  subcategory: { type: String, default: '' },
  brand: { type: String, default: '' },
  unit: { type: String, default: 'unidad' },
  prices: {
    cost: { type: Number, default: 0 },
    sale: { type: Number, default: 0 },
    wholesale: { type: Number, default: 0 },
    currency: { type: String, default: 'PEN' }
  },
  tax: { 
    included: { type: Boolean, default: true }, 
    rate: { type: Number, default: 18 } 
  },
  inventory: {
    current: { type: Number, default: 0 },
    minimum: { type: Number, default: 0 },
    maximum: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    location: { type: String, default: '' }
  },
  images: [{
    url: String,
    isMain: Boolean
  }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  tags: [String]
}, { timestamps: true });

// Índice para búsquedas
productSchema.index({ name: 'text', barcode: 'text' });

// Actualizar available antes de guardar
productSchema.pre('save', function(next) {
  this.inventory.available = this.inventory.current;
  next();
});

module.exports = mongoose.model('Product', productSchema);