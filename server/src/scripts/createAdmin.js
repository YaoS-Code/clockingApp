require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function createAdminUser() {
    try {
        const hashedPassword = await bcrypt.hash('8780', 10);
        
        // Check if admin exists
        const [existingAdmin] = await db.query(
            'SELECT * FROM users WHERE username = ?',
            ['manager']
        );

        if (existingAdmin.length > 0) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        await db.query(
            `INSERT INTO users (username, password, email, full_name, role) 
             VALUES (?, ?, ?, ?, ?)`,
            ['manager', hashedPassword, 'manager@company.com', 'System Manager', 'admin']
        );

        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        process.exit();
    }
}

createAdminUser();