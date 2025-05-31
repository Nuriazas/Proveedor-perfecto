import getFreelancerById from "../../services/users/getFreelancerById.js";

async function getFreelancerByIdController(req, res) {
	try {
		const { id } = req.params;
		const freelancer = await getFreelancerById(id);
		console.log(`Freelancer ID: ${id}`, freelancer);

		if (!freelancer) {
			return res.status(404).json({
				success: false,
				message: "Freelancer no encontrado",
			});
		}

		res.json({
			success: true,
			data: freelancer,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}

export default getFreelancerByIdController;
