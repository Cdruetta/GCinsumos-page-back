const prisma = require('../config/database')

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

        const product = await prisma.product.create({
            data: {
                name,
                category,
                price: parseInt(price),
                stock: parseInt(stock),
                description,
                image: image || '/generic-product-display.png',
            },
        })

        res.status(201).json(product)
    } catch (error) {
        console.error('Error al crear producto:', error)
        res.status(500).json({ error: 'Error al crear producto' })
    }
}

// Actualizar un producto
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        const { name, category, price, stock, description, image } = req.body

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                category,
                price: parseInt(price),
                stock: parseInt(stock),
                description,
                image,
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
