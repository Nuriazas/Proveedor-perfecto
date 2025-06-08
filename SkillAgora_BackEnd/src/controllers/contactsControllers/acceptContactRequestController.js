import acceptContactRequestService from "../../services/contactsServices/acceptContactRequestService.js";

const acceptContactRequestController = async (req, res, next) => {
	try {
		const { notificationId } = req.params;
		const userId = "1"; // asumimos que el middleware auth ya setea req.user
		console.log("Depuración controlador aceptar solicitud de contacto:", {
			notificationId,
			userId,
		});

		await acceptContactRequestService(notificationId, userId);

		res.status(200).send({
			status: "ok",
			message: "Solicitud de contacto aceptada correctamente.",
		});
	} catch (error) {
		next(error);
	}
};

export default acceptContactRequestController;
