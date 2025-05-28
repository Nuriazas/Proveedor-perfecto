import randomstring from 'randomstring';
import generateErrorsUtils from '../../utils/generateErrorsUtils.js';
import insertUserService from '../../services/users/insertUserService.js';


const registerUserController = async (req, res, next) => {

    try {
        const { email, password } = req.body;

        // Validar que se proporcionen email y password
        if (!email || !password) throw generateErrorsUtils('Se requiere email o contaseña', 400);

        // Generar un código de registro aleatorio
        const registrationCode = randomstring.generate({
            length: 15,
            charset: 'alphanumeric'
        });
        

        await insertUserService(email, password, registrationCode);

        res.send({
            status: 'ok',
            message: 'Usuario registrado correctamente. Revisa tu correo para activar tu cuenta.'
        })
    } catch (error) {
        next(error);
    }




};
export default registerUserController;