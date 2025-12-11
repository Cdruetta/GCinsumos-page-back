const prisma = require('../config/database')
const { downloadImageFromUrl, deleteImageFile } = require('../utils/imageDownloader')

// Obtener todos los productos con filtros opcionales
exports.getAllProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query

        const where = {}

        if (category && category !== 'Todos') {
            where.category = category
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.gte = parseInt(minPrice)
            if (maxPrice) where.price.lte = parseInt(maxPrice)
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        })

        res.json(products)
    } catch (error) {
        console.error('Error al obtener productos:', error)
        res.status(500).json({ error: 'Error al obtener productos' })
    }
}

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        })

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }

        res.json(product)
    } catch (error) {
        console.error('Error al obtener producto:', error)
        res.status(500).json({ error: 'Error al obtener producto' })
    }
}

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
    try {
        const { name, category, price, stock, description, image } = req.body

        let imagePath = image || '/generic-product-display.png'

        // Si se proporciona una URL de imagen, descargarla y guardarla localmente
        if (image && (image.startsWith('http://') || image.startsWith('https://'))) {
            try {
                imagePath = await downloadImageFromUrl(image, name)
                console.log(`✅ Imagen descargada y guardada: ${imagePath}`)
            } catch (downloadError) {
                console.error('Error al descargar imagen:', downloadError.message)
                // Si falla la descarga, usar la imagen por defecto o la URL original
                imagePath = image // Mantener la URL original si falla la descarga
            }
        }

        const product = await prisma.product.create({
            data: {
                name,
                category,
                price: parseInt(price),
                stock: parseInt(stock),
                description,
                image: imagePath,
            },
        })

        res.status(201).json(product)
    } catch (error) {
        console.error('Error al crear producto:', error)
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ya existe un producto con estos datos' })
        }
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Error de referencia en la base de datos' })
        }
        res.status(500).json({ 
            error: 'Error al crear producto',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

// Actualizar un producto
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        const { name, category, price, stock, description, image } = req.body

        // Obtener el producto actual para verificar si tiene una imagen local que eliminar
        const currentProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        })

        if (!currentProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }

        let imagePath = image

        // Si se proporciona una nueva URL de imagen, descargarla y guardarla localmente
        if (image && (image.startsWith('http://') || image.startsWith('https://'))) {
            try {
                imagePath = await downloadImageFromUrl(image, name || currentProduct.name)
                console.log(`✅ Imagen descargada y guardada: ${imagePath}`)
                
                // Eliminar la imagen anterior si existe y es local
                if (currentProduct.image && currentProduct.image.startsWith('/uploads/images/')) {
                    await deleteImageFile(currentProduct.image)
                }
            } catch (downloadError) {
                console.error('Error al descargar imagen:', downloadError.message)
                // Si falla la descarga, mantener la imagen actual o usar la URL
                imagePath = image
            }
        } else if (image && image !== currentProduct.image) {
            // Si se cambia a una nueva imagen local, eliminar la anterior
            if (currentProduct.image && currentProduct.image.startsWith('/uploads/images/')) {
                await deleteImageFile(currentProduct.image)
            }
        }

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                category,
                price: parseInt(price),
                stock: parseInt(stock),
                description,
                image: imagePath,
            },
        })

        res.json(product)
    } catch (error) {
        console.error('Error al actualizar producto:', error)
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }
        res.status(500).json({ error: 'Error al actualizar producto' })
    }
}

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        // Obtener el producto para eliminar su imagen si es local
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        })

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }

        // Eliminar la imagen del sistema de archivos si es local
        if (product.image && product.image.startsWith('/uploads/images/')) {
            await deleteImageFile(product.image)
        }

        await prisma.product.delete({
            where: { id: parseInt(id) },
        })

        res.json({ message: 'Producto eliminado exitosamente' })
    } catch (error) {
        console.error('Error al eliminar producto:', error)
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }
        res.status(500).json({ error: 'Error al eliminar producto' })
    }
}

// Actualizar solo el stock de un producto
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params
        const { stock } = req.body

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: { stock: parseInt(stock) },
        })

        res.json(product)
    } catch (error) {
        console.error('Error al actualizar stock:', error)
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }
        res.status(500).json({ error: 'Error al actualizar stock' })
    }
}
