const prisma = require('../config/database')

// Crear una nueva orden con verificación de stock y totales del servidor
exports.createOrder = async (req, res) => {
    try {
        const { items } = req.body

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'La orden debe tener al menos un item' })
        }

        // Cargar productos desde la BD para obtener precios y stock actuales
        const productIds = items.map((item) => item.productId)
        const dbProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, price: true, stock: true },
        })

        // Mapear productos para acceso rápido
        const productsMap = new Map(dbProducts.map((p) => [p.id, p]))

        // Validar existencia y stock suficiente
        for (const item of items) {
            const product = productsMap.get(item.productId)
            if (!product) {
                return res.status(404).json({ error: `Producto ${item.productId} no encontrado` })
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    error: `Stock insuficiente para el producto ${item.productId}`,
                })
            }
        }

        // Calcular totales usando precios de la BD
        const subtotal = items.reduce((acc, item) => {
            const product = productsMap.get(item.productId)
            return acc + product.price * item.quantity
        }, 0)

        const taxRate = parseFloat(process.env.TAX_RATE || '0')
        const tax = Math.round(subtotal * taxRate)
        const total = subtotal + tax

        // Ejecutar todo en una sola transacción para evitar inconsistencias
        const order = await prisma.$transaction(async (tx) => {
            // Crear orden
            const createdOrder = await tx.order.create({
                data: {
                    subtotal,
                    tax,
                    total,
                    status: 'completed',
                    items: {
                        create: items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: productsMap.get(item.productId).price,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            })

            // Actualizar stock dentro de la misma transacción
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                    select: { stock: true },
                })

                if (!product || product.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para el producto ${item.productId}`)
                }

                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                })
            }

            return createdOrder
        })

        res.status(201).json(order)
    } catch (error) {
        console.error('Error al crear orden:', error)
        if (typeof error.message === 'string' && error.message.includes('Stock insuficiente')) {
            return res.status(400).json({ error: error.message })
        }
        res.status(500).json({ error: 'Error al crear orden' })
    }
}

// Obtener una orden por ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params

        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        })

        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada' })
        }

        res.json(order)
    } catch (error) {
        console.error('Error al obtener orden:', error)
        res.status(500).json({ error: 'Error al obtener orden' })
    }
}

// Obtener todas las órdenes
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        res.json(orders)
    } catch (error) {
        console.error('Error al obtener órdenes:', error)
        res.status(500).json({ error: 'Error al obtener órdenes' })
    }
}
