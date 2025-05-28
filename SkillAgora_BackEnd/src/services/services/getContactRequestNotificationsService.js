import getpool from "../../db/getPool.js";

const getContactRequestNotificationsService = async () => {
	try {
		const pool = await getpool();

		const query = `
        SELECT * FROM notification n
        JOIN users u ON n.user_id = u.id
        WHERE n.type = 'message' AND n.is_read = false
        ORDER BY n.created_at DESC
        `;

		const [notifications] = await pool.execute(query);

		const result = notifications.map((notification) => ({
			id: notification.id,
			userId: notification.user_id,
			content: notification.content,
			type: notification.type,
			isRead: notification.is_read,
			emailSent: notification.email_sent,
			emailSentAt: notification.email_sent_at,
			createdAt: notification.created_at,
		}));
		return result;
	} catch (error) {
		console.error("Error fetching contact request notifications:", error);
	}
};

export default getContactRequestNotificationsService;
