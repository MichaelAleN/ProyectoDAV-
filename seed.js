require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Conectado a MongoDB');

  const collections = ['customers', 'products', 'users', 'sales', 'inventorymovements'];
  for (const coll of collections) {
    await mongoose.connection.collection(coll).deleteMany({});
  }

  const adminUser = await mongoose.connection.collection('users').insertOne({
    username: 'admin',
    email: 'admin@sigme.com',
    password: await bcrypt.hash('admin123', 12),
    firstName: 'Administrador',
    lastName: 'Sistema',
    fullName: 'Administrador Sistema',
    role: 'administrator',
    status: 'active',
    createdAt: new Date()
  });

  await mongoose.connection.collection('users').insertOne({
    username: 'vendedor',
    email: 'vendedor@sigme.com',
    password: await bcrypt.hash('vendedor123', 12),
    firstName: 'Juan',
    lastName: 'Pérez',
    fullName: 'Juan Pérez',
    role: 'seller',
    status: 'active',
    createdAt: new Date()
  });

  await mongoose.connection.collection('customers').insertMany([
    { customerCode: 'CLI-00001', documentType: 'DNI', documentNumber: '12345678', businessName: 'Juan García López', email: 'juan@email.com', phone: '987654321', category: 'minorista', creditLimit: 500, currentDebt: 0, status: 'active', createdAt: new Date() },
    { customerCode: 'CLI-00002', documentType: 'RUC', documentNumber: '20123456789', businessName: 'Empresa Comercial S.A.C.', email: 'contacto@empresa.com', phone: '912345678', category: 'corporativo', creditLimit: 5000, currentDebt: 0, status: 'active', createdAt: new Date() }
  ]);

  await mongoose.connection.collection('products').insertMany([
    { productCode: 'PROD-00001', barcode: '8901234567890', name: 'Laptop HP 15.6" Ryzen 5', description: 'Laptop HP con procesador Ryzen 5, 8GB RAM, 512GB SSD', prices: { cost: 1850, sale: 2499, wholesale: 2299 }, tax: { included: true, rate: 18 }, inventory: { current: 15, minimum: 5, maximum: 50, available: 15 }, status: 'active', createdAt: new Date() },
    { productCode: 'PROD-00002', barcode: '8901234567891', name: 'Mouse Inalámbrico Logitech M170', description: 'Mouse inalámbrico compacto', prices: { cost: 25, sale: 45, wholesale: 38 }, tax: { included: true, rate: 18 }, inventory: { current: 50, minimum: 10, maximum: 100, available: 50 }, status: 'active', createdAt: new Date() },
    { productCode: 'PROD-00003', barcode: '8901234567892', name: 'Teclado Mecánico RGB', description: 'Teclado mecánico con iluminación RGB', prices: { cost: 80, sale: 149, wholesale: 120 }, tax: { included: true, rate: 18 }, inventory: { current: 3, minimum: 5, maximum: 30, available: 3 }, status: 'active', createdAt: new Date() }
  ]);

  console.log('✅ Datos de prueba creados');
  console.log('📋 Admin: admin / admin123');
  console.log('📋 Vendedor: vendedor / vendedor123');

  await mongoose.connection.close();
  process.exit(0);
};

seedData().catch(err => { console.error('❌ Error:', err); process.exit(1); });