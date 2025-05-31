import getAllFreelancers from "../../services/users/getAllFreelancers.js";

async function getAllFreelancersController(req, res) {
	try {
		const freelancers = await getAllFreelancers();
		res.json({
			success: true,
			data: freelancers,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}

export default getAllFreelancersController;
