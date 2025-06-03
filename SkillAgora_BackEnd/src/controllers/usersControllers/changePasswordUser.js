import bcrypt from "bcrypt";
import changePasswordsService from "../../services/usersServices/changePasswordsService.js";

const changePasswordUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    // Llamar al servicio para obtener al usuario
    const user = await changePasswordsService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Llamar al servicio para actualizar la contraseña
    await changePasswordsService.updatePassword(userId, hashedPassword);

    res.json({ message: "Contraseña actualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export default changePasswordUser;
