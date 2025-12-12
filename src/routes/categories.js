const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')

// Rutas de categorías
router.get('/', categoryController.getAllCategories) // Obtener todas las categorías (con opción ?activeOnly=true)
router.get('/products', categoryController.getProductCategories) // Obtener categorías únicas de productos (para compatibilidad)
router.get('/:id', categoryController.getCategoryById) // Obtener una categoría por ID
router.post('/', categoryController.createCategory) // Crear una nueva categoría
router.put('/:id', categoryController.updateCategory) // Actualizar una categoría
router.delete('/:id', categoryController.deleteCategory) // Eliminar una categoría

module.exports = router
