const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')
const { validateProduct, validateStock } = require('../middleware/validation')

// Rutas de productos
router.get('/', productController.getAllProducts)
router.get('/:id', productController.getProductById)
router.post('/', validateProduct, productController.createProduct)
router.put('/:id', validateProduct, productController.updateProduct)
router.delete('/:id', productController.deleteProduct)
router.patch('/:id/stock', validateStock, productController.updateStock)

module.exports = router
