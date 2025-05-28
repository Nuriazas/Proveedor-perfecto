import getPool from '../../db/getPool.js';


const selectUserByEmailService = async (email, password) => {
    const pool =  getPool();
    const [user] = await pool.query(
        `SELECT FROM users email, password `
    );

    

    return user[0];
}

export default selectUserByEmailService;