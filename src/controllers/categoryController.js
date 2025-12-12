const prisma = require('../config/database')

// Obtener todas las categorías (activas e inactivas para admin)
exports.getAllCategories = async (req, res) => {
    try {
        const { activeOnly } = req.query
        
        const where = {}
        if (activeOnly === 'true') {
            where.active = true
        }

        const categories = await prisma.category.findMany({
            where,
            orderBy: { name: 'asc' },
        })

        // Contar productos por categoría
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const productCount = await prisma.product.count({
                    where: { category: category.name }
                })
                return {
                    ...category,
                    productCount
                }
            })
        )

        res.json(categoriesWithCount)
    } catch (error) {
        console.error('Error al obtener categorías:', error)
        res.status(500).json({ error: 'Error al obtener categorías' })
    }
}

// Obtener una categoría por ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params

        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
        })

        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' })
        }

        // Contar productos de esta categoría
        const productCount = await prisma.product.count({
            where: { category: category.name }
        })

        res.json({
            ...category,
            productCount
        })
    } catch (error) {
        console.error('Error al obtener categoría:', error)
        res.status(500).json({ error: 'Error al obtener categoría' })
    }
}

// Crear una nueva categoría
exports.createCategory = async (req, res) => {
    try {
        const { name, description, active } = req.body

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'El nombre de la categoría es requerido' })
        }

        // Verificar si la categoría ya existe
        const existingCategory = await prisma.category.findUnique({
            where: { name: name.trim() }
        })

        if (existingCategory) {
            return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' })
        }

        const category = await prisma.category.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                active: active !== undefined ? active : true,
            },
        })

        res.status(201).json(category)
    } catch (error) {
        console.error('Error al crear categoría:', error)
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ya existe una categoría con este nombre' })
        }
        res.status(500).json({ 
            error: 'Error al crear categoría',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

// Actualizar una categoría
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description, active } = req.body

        // Verificar si la categoría existe
        const existingCategory = await prisma.category.findUnique({
            where: { id: parseInt(id) }
        })

        if (!existingCategory) {
            return res.status(404).json({ error: 'Categoría no encontrada' })
        }

        // Si se está cambiando el nombre, verificar que no exista otra con ese nombre
        if (name && name.trim() !== existingCategory.name) {
            const duplicateCategory = await prisma.category.findUnique({
                where: { name: name.trim() }
            })

            if (duplicateCategory) {
                return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' })
            }
        }

        const updateData = {}
        if (name !== undefined) updateData.name = name.trim()
        if (description !== undefined) updateData.description = description?.trim() || null
        if (active !== undefined) updateData.active = active

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: updateData,
        })

        res.json(category)
    } catch (error) {
        console.error('Error al actualizar categoría:', error)
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Categoría no encontrada' })
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ya existe una categoría con este nombre' })
        }
        res.status(500).json({ error: 'Error al actualizar categoría' })
    }
}

// Eliminar una categoría
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params

        // Verificar si la categoría existe
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
        })

        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' })
        }

        // Verificar si hay productos usando esta categoría (usando el campo String category)
        const productsCount = await prisma.product.count({
            where: { category: category.name },
        })

        if (productsCount > 0) {
            return res.status(400).json({ 
                error: `No se puede eliminar la categoría porque tiene ${productsCount} producto(s) asociado(s). Primero actualiza o elimina los productos.`,
                productsCount: productsCount
            })
        }

        await prisma.category.delete({
            where: { id: parseInt(id) },
        })

        res.json({ message: 'Categoría eliminada exitosamente' })
    } catch (error) {
        console.error('Error al eliminar categoría:', error)
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Categoría no encontrada' })
        }
        res.status(500).json({ error: 'Error al eliminar categoría' })
    }
}

// Obtener categorías únicas de productos (para compatibilidad con el frontend existente)
exports.getProductCategories = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            select: { category: true },
            distinct: ['category'],
        })

        const categories = ['Todos', ...products.map((p) => p.category).sort()]

        res.json(categories)
    } catch (error) {
        console.error('Error al obtener categorías de productos:', error)
        res.status(500).json({ error: 'Error al obtener categorías de productos' })
    }
}
