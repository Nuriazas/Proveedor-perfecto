import getPool from './src/db/getPool.js';

async function testNotification() {
  try {
    const pool = await getPool();
    
    console.log('🧪 === PROBANDO CREACIÓN DE NOTIFICACIÓN ===');
    
    // 1. Verificar que el usuario admin existe
    console.log('\n👤 1. Verificando usuario admin (ID 1):');
    const [adminUser] = await pool.query('SELECT id, name, lastName, role FROM users WHERE id = 1');
    console.log('Usuario admin:', adminUser);
    
    if (adminUser.length === 0) {
      console.log('❌ ERROR: No existe usuario con ID 1');
      return;
    }
    
    // 2. Verificar que el usuario 2 existe
    console.log('\n👤 2. Verificando usuario 2:');
    const [user2] = await pool.query('SELECT id, name, lastName, role FROM users WHERE id = 2');
    console.log('Usuario 2:', user2);
    
    if (user2.length === 0) {
      console.log('❌ ERROR: No existe usuario con ID 2');
      return;
    }
    
    // 3. Intentar crear la notificación manualmente
    console.log('\n📧 3. Intentando crear notificación manualmente:');
    try {
      const [result] = await pool.query(
        `INSERT INTO notification (user_id, sender_id, type, content, status, is_read, created_at)
         VALUES (?, ?, 'contact_request', ?, 'contact_request_pending', false, NOW())`,
        [1, 2, `${user2[0].name} ${user2[0].lastName || ''}`.trim() + ' solicita ser freelancer']
      );
      console.log('✅ Notificación creada con ID:', result.insertId);
    } catch (error) {
      console.log('❌ Error al crear notificación:', error.message);
      console.log('Error completo:', error);
    }
    
    // 4. Verificar si se creó
    console.log('\n📋 4. Verificando notificaciones del admin:');
    const [notifications] = await pool.query('SELECT * FROM notification WHERE user_id = 1 ORDER BY created_at DESC LIMIT 3');
    console.log('Notificaciones del admin:');
    console.table(notifications);
    
    console.log('\n🧪 === FIN PRUEBA ===');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testNotification(); 