import { savePhotoUtils,deletePhotoUtils } from "../../utils/photoUtils.js";

export const uploadServicePhotoService = async (imgs, oldImgs) => {

if(!imgs) throw new Error('No se ha enviado ningun archivo de imagen');

 imgs = Array.isArray(imgs) ? imgs : [imgs];
 oldImgs = Array.isArray(oldImgs) ? oldImgs : [oldImgs];

if(imgs.length >3) throw new Error('Solo se pueden subir 3 imágenes');
 
 for (const oldImg of oldImgs) {
     
         await deletePhotoUtils(oldImg); // Eliminar la imagen anterior si existe
     
 }
 const filesName=[];

 for (const img of imgs) {
     const fileName = await savePhotoUtils(img, 800);
     filesName.push(fileName);
 }

 
 return {
     message: oldImgs 
     ? 'Imagen actualizada correctamente' 
     : 'Imagen guardada correctamente',
     filesName,
 };

};