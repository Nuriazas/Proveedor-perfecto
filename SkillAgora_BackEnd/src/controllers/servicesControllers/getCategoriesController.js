import getCategoriesService from '../../services/servicesServices/getCategoriesService.js';

const getCategoriesController = async (req, res, next) => {
    try {
        const categories = await getCategoriesService();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

export default getCategoriesController;