const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')
const { validateOrder } = require('../middleware/validation')

// Rutas de órdenes
router.post('/', validateOrder, orderController.createOrder)
router.get('/:id', orderController.getOrderById)
router.get('/', orderController.getAllOrders)

module.exports = router
