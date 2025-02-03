require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "Z2Rh6VGr7DE=",
        });

        console.log('Connected to MySQL server');

        // Drop database if not exists
       //  await connection.query(`Drop DATABASE  ${process.env.DB_NAME}`);
        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS clockingapp`);
        console.log(`Database clockingapp ensured`);

        // Use the database
        await connection.query(`USE clockingapp`);

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                status ENUM('active', 'inactive') DEFAULT 'active',
                INDEX idx_username (username),
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Users table ensured');

        // Create clock_records table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS clock_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                clock_in DATETIME NOT NULL,
                clock_out DATETIME,
                status ENUM('in', 'out') NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                modified_by INT,
                location VARCHAR(255),
                ip_address VARCHAR(45),
                device_info VARCHAR(255),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (modified_by) REFERENCES users(id),
                INDEX idx_user_id (user_id),
                INDEX idx_clock_in (clock_in),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Clock records table ensured');

        // Create audit_logs table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action VARCHAR(50) NOT NULL,
                table_name VARCHAR(50) NOT NULL,
                record_id INT,
                old_values JSON,
                new_values JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address VARCHAR(45),
                FOREIGN KEY (user_id) REFERENCES users(id),
                INDEX idx_user_id (user_id),
                INDEX idx_action (action),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('Audit logs table ensured');

        // Create default admin user if not exists
        const hashedPassword = await bcrypt.hash('8780', 10);
        await connection.query(`
            INSERT IGNORE INTO users (username, password, email, full_name, role)
            VALUES (?, ?, ?, ?, ?)
        `, ['manager', hashedPassword, 'manager@company.com', 'System Manager', 'admin']);
        console.log('Default admin user ensured');

        console.log('Database initialization completed successfully');

    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
};

// Run the initialization
initDatabase()
    .then(() => {
        console.log('Database setup completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Database setup failed:', error);
        process.exit(1);
    });
