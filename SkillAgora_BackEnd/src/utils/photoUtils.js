import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import generateErrorsUtils from "./generateErrorsUtils.js";

const { UPLOAD_DIR } = process.env;

// funcion para guardar una foto
export const savePhotoUtils = async (img, width) => {
	// Validar que la imagen sea un buffer
	try {
		const uploadDir = path.join(process.cwd(), `src/${UPLOAD_DIR}`);
		// Verificar si el directorio de subida existe, si no, lo creamos
		try {
			await fs.access(uploadDir);
		} catch (error) {
			await fs.mkdir(uploadDir, { recursive: true });
		}
		// Generar un nombre único para la imagen
		const imgSharp = sharp(img.data);
		// Redimensionar la imagen al ancho especificado, manteniendo la relación de aspecto
		imgSharp.resize({ width: width, fit: "inside" });
		// Convertir la imagen a formato JPEG
		const imgName = `${uuidv4()}.jpg`;
		// Definir la ruta completa donde se guardará la imagen
		const imgPath = path.join(uploadDir, imgName);
		// Guardar la imagen en el directorio de subida
		await imgSharp.toFile(imgPath);
		return imgName;
	} catch (error) {
		throw generateErrorsUtils("Error al guardar la foto", 500, error);
	}
};
// funcion para eliminar una foto
export const deletePhotoUtils = async (imgName) => {
	// Validar que el nombre de la imagen sea una cadena
	try {
		const imgPath = path.join(process.cwd(), `src/${UPLOAD_DIR}`, imgName);
		// Verificar si el archivo existe antes de intentar eliminarlo
		try {
			await fs.access(imgPath);
			// Si el archivo existe, lo eliminamos
		} catch (error) {
			return; // Si el archivo no existe, no hacemos nada
		}
		// Eliminar la imagen del sistema de archivos
		await fs.unlink(imgPath);
	} catch (error) {
		generateErrorsUtils("Error al eliminar la imagen seleccionada", 500, error);
	}
};
