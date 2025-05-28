import getServiceStatisticsService from '../../services/services/getServiceStatisticsService.js';

const getServiceStatisticsController = async (req, res, next) => {
    try {
        const serviceStats = await getServiceStatisticsService();
        res.status(200).json({ success: true, data: serviceStats });
    } catch (error) {
        next(error);
    }
};

export default getServiceStatisticsController;