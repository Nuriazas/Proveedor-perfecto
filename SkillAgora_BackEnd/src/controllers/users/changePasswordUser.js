//const bcrypt = require('bcrypt');
//const User = require('../../db/User'); 
import bcrypt from "bcrypt";

const changePasswordUser = async (req, res) => {
    // Cambia la contraseña del usuario autenticado
  try {
    const userId = req.user.id; 
    const { currentPassword, newPassword } = req.body;
    // Verifica que se hayan proporcionado las contraseñas actuales y nuevas
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    // Verifica que la nueva contraseña tenga al menos 6 caracteres
    const user = await User.findById(userId);
    // Si el usuario no existe, devuelve un error 404
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    // Verifica que la contraseña actual coincida con la almacenada en la base de datos
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'La contraseña actual no es válida' });
    }
    // Verifica que la nueva contraseña sea diferente de la actual
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    // Si todo es correcto, actualiza la contraseña del usuario y devuelve un mensaje de éxito
    res.status(200).json({ message: 'Contraseña cambiada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

export default changePasswordUser;