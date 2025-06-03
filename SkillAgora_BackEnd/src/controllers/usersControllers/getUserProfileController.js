import getUserProfileService from "../../services/usersServices/getUserProfileService.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const getUserProfileController = async (req, res, next) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      throw generateErrorsUtils("User ID is required", 400);
    }
  } catch (error) {}
};
