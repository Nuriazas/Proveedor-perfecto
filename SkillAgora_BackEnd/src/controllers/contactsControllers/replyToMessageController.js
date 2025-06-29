import replyToMessageService from "../../services/contactsServices/replyToMessageService.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const replyToMessageController = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { replyMessage } = req.body;
    const currentUserId = req.user?.id;

    console.log("🎯 CONTROLADOR REPLY - messageId:", messageId);
    console.log("🎯 CONTROLADOR REPLY - replyMessage:", replyMessage);
    console.log("🎯 CONTROLADOR REPLY - currentUserId:", currentUserId);

    if (!currentUserId) {
      throw generateErrorsUtils("Usuario no autenticado", 401);
    }

    if (!messageId || isNaN(messageId)) {
      throw generateErrorsUtils("ID de mensaje inválido", 400);
    }

    if (!replyMessage || !replyMessage.trim()) {
      throw generateErrorsUtils("El mensaje de respuesta es requerido", 400);
    }

    const result = await replyToMessageService(
      parseInt(messageId),
      replyMessage.trim(),
      currentUserId
    );

    console.log("🎯 CONTROLADOR REPLY - Resultado del servicio:", result);

    res.status(201).json({
      success: true,
      message: "Respuesta enviada exitosamente",
      data: {
        notificationId: result.notificationId,
        recipientName: result.recipientName,
        originalMessageId: result.originalMessageId
      }
    });

  } catch (error) {
    console.error("❌ ERROR en replyToMessageController:", error);
    next(error);
  }
};

export default replyToMessageController;