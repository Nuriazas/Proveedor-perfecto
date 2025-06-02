import { savePhotoUtils,deletePhotoUtils } from "../../utils/photoUtils.js";

export const uploadProfilePhotoService = async (img, oldImg) => {
    
    if(!img) throw new Error('No se ha enviado ningun archivo de imagen');

    if (oldImg){
        await deletePhotoUtils(oldImg); // Eliminar la imagen anterior si existe
    }
    // Verificar que solo se haya enviado una imagen

    const fileName = await savePhotoUtils(img, 300);
    // Guardar la imagen con un tamaño máximo de 300px de ancho
    return {
        message: oldImg
        ? 'Imagen actualizada correctamente' 
        : 'Imagen guardada correctamente',
        fileName,
    };
    
};
