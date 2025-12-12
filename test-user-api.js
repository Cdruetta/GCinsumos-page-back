// Script rápido para probar la API de usuarios
const axios = require('axios')

const API_URL = process.env.API_URL || 'http://localhost:5000'

async function testUserAPI() {
  console.log('🧪 Probando API de usuarios...\n')
  
  try {
    // 1. Obtener todos los usuarios
    console.log('1. Obteniendo usuarios existentes...')
    try {
      const getResponse = await axios.get(`${API_URL}/api/users`)
      console.log('✅ GET /api/users:', getResponse.data)
      console.log(`   Usuarios encontrados: ${getResponse.data.length}\n`)
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error.response?.data || error.message)
      if (error.code === 'ECONNREFUSED') {
        console.error('   ⚠️ El servidor no está corriendo. Inicia el servidor con: npm start\n')
      }
      return
    }
    
    // 2. Crear un usuario de prueba
    console.log('2. Creando usuario de prueba...')
    const testUser = {
      username: `test_${Date.now()}`,
      password: 'test123',
      role: 'admin',
      active: true
    }
    
    try {
      const createResponse = await axios.post(`${API_URL}/api/users`, testUser)
      console.log('✅ Usuario creado exitosamente:', createResponse.data)
      console.log(`   ID: ${createResponse.data.id}`)
      console.log(`   Username: ${createResponse.data.username}\n`)
      
      // 3. Eliminar el usuario de prueba
      console.log('3. Eliminando usuario de prueba...')
      try {
        await axios.delete(`${API_URL}/api/users/${createResponse.data.id}`)
        console.log('✅ Usuario eliminado exitosamente\n')
      } catch (error) {
        console.error('⚠️ Error al eliminar usuario de prueba:', error.response?.data || error.message)
      }
      
    } catch (error) {
      console.error('❌ Error al crear usuario:', error.response?.data || error.message)
      if (error.response?.status === 500) {
        console.error('   ⚠️ Error del servidor. Revisa los logs del backend.')
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testUserAPI()

