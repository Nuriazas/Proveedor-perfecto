import getPool from "../../db/getPool.js";

const acceptOrderService = async (orderId) => {
    const pool = await getPool();

    await pool.query(
        `
        UPDATE orders
        SET status = 'in_progress'
        WHERE id = ?
        `,
        [orderId]
    );
};

export default acceptOrderService;
