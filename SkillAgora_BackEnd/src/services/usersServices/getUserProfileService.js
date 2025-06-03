import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";


const getUserProfileService = async (userId) => {
    const pool = getPool();

    
        const [userRows] = await pool.query(

            `
                SELECT  
                    email, 
                    name, firstName,
                    lastName, 
                    avatar, 
                    role, 
                    bio,
                    IFNULL(AVG(r.rating), 0) AS averageRating 
                FROM users u
                LEFT JOIN reviews r ON r.order_id = o.id
                LEFT JOIN orders o ON o.userId = u.id
                WHERE u.id = ?
                WHERE id = ?
                GROUP BY u.id
            
            `,[userId]


        );

        if(userRows.length === 0) {
            throw generateErrorsUtils("Usuario no encontrado", 404);
        }  
        
        const [services] = await pool.query(
            `
                SELECT 
                    id,
                    title,
                    description,
                    price,
                FROM services
                WHERE user_id = ?
            
            `
        ,[userId]);
        return{
            user: userRows[0],
            services,
        };
    
    
    };

    export default getUserProfileService;