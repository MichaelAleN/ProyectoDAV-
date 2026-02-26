const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'No hay token de autorización' 
      });
    }

    // Verificar formato Bearer
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token no proporcionado' 
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario inactivo' 
      });
    }

    // Asignar usuario a la request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.log('Error de autenticación:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado' 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Error de autenticación' 
    });
  }
};

module.exports = auth;
