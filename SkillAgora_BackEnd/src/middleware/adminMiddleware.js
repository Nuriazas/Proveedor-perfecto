const adminMiddleware = (req, res, next) => {
	if (!req.user.is_admin) {
		return res.status(403).json({ message: "Access denied. Admin privileges required." });
	}
	next();
};

export default adminMiddleware;