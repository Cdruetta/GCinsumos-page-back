const axios = require('axios')
const fs = require('fs').promises
const path = require('path')

/**
 * Descarga una imagen desde una URL y la guarda localmente
 * @param {string} imageUrl - URL de la imagen a descargar
 * @param {string} productName - Nombre del producto para generar el nombre del archivo
 * @returns {Promise<string>} - Ruta relativa de la imagen guardada
 */
async function downloadImageFromUrl(imageUrl, productName = 'product') {
    try {
        // Validar que sea una URL válida
        if (!imageUrl || typeof imageUrl !== 'string') {
            throw new Error('URL de imagen inválida')
        }

        // Verificar que sea una URL HTTP/HTTPS
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            // Si no es una URL, retornar el valor original (puede ser una ruta local)
            return imageUrl
        }

        // Hacer la petición para descargar la imagen
        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'arraybuffer',
            timeout: 10000, // 10 segundos de timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })

        // Obtener el tipo de contenido de la imagen
        const contentType = response.headers['content-type'] || 'image/jpeg'
        
        // Determinar la extensión del archivo basado en el content-type
        let extension = '.jpg'
        if (contentType.includes('png')) {
            extension = '.png'
        } else if (contentType.includes('gif')) {
            extension = '.gif'
        } else if (contentType.includes('webp')) {
            extension = '.webp'
        } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
            extension = '.jpg'
        } else {
            // Intentar obtener la extensión de la URL
            const urlExtension = path.extname(new URL(imageUrl).pathname).toLowerCase()
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(urlExtension)) {
                extension = urlExtension
            }
        }

        // Generar un nombre único para el archivo
        const sanitizedName = productName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 50) // Limitar longitud
        
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const fileName = `${sanitizedName}-${timestamp}-${randomSuffix}${extension}`
        
        // Ruta completa donde se guardará la imagen
        const uploadsDir = path.join(__dirname, '../../uploads/images')
        const filePath = path.join(uploadsDir, fileName)

        // Asegurar que el directorio existe
        await fs.mkdir(uploadsDir, { recursive: true })

        // Guardar la imagen
        await fs.writeFile(filePath, response.data)

        // Retornar la ruta relativa para guardar en la base de datos
        return `/uploads/images/${fileName}`
    } catch (error) {
        console.error('Error al descargar imagen:', error.message)
        // Si hay un error, retornar la URL original o una imagen por defecto
        throw new Error(`No se pudo descargar la imagen: ${error.message}`)
    }
}

/**
 * Elimina una imagen del sistema de archivos
 * @param {string} imagePath - Ruta de la imagen a eliminar
 */
async function deleteImageFile(imagePath) {
    try {
        if (!imagePath || !imagePath.startsWith('/uploads/images/')) {
            return // No es una imagen local, no hacer nada
        }

        const filePath = path.join(__dirname, '../../', imagePath)
        await fs.unlink(filePath)
    } catch (error) {
        // Si el archivo no existe o hay otro error, solo loguear
        console.error('Error al eliminar imagen:', error.message)
    }
}

module.exports = {
    downloadImageFromUrl,
    deleteImageFile
}


