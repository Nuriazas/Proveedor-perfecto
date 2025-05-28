import getContactRequestNotificationsService from "../../services/services/getContactRequestNotificationsService.js";

const getContactRequestNotificationsController = async (req, res, next) => {
	try {
		const results = await getContactRequestNotificationsService();
		res.status(200).json({ success: true, data: results });
	} catch (error) {
		next(error);
	}
};

export default getContactRequestNotificationsController;
