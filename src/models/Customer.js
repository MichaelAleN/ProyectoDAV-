const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerCode: { 
    type: String, 
    default: function() {
      return `CLI-${Date.now().toString(36).toUpperCase()}`;
    }
  },
  documentType: { type: String, enum: ['DNI', 'RUC'], default: 'DNI' },
  documentNumber: { type: String, required: true, unique: true },
  businessName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    district: String,
    city: String
  },
  category: { type: String, enum: ['minorista', 'mayorista', 'corporativo'], default: 'minorista' },
  creditLimit: { type: Number, default: 0 },
  currentDebt: { type: Number, default: 0 },
  paymentTerms: { type: String, default: 'contado' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Índice para búsquedas rápidas
customerSchema.index({ businessName: 'text', documentNumber: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
