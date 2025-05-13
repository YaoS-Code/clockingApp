-- 设置时区
SET GLOBAL time_zone = '-07:00';
SET time_zone = '-07:00';

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  status ENUM('active', 'inactive') DEFAULT 'active'
);

-- 创建时钟记录表
CREATE TABLE IF NOT EXISTS clock_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  clock_in TIMESTAMP NOT NULL,
  clock_out TIMESTAMP NULL,
  break_minutes INT DEFAULT 30,
  location_in VARCHAR(255),
  location_out VARCHAR(255),
  total_hours DECIMAL(5,2), 
  notes TEXT,
  status ENUM('active', 'deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建修正请求表
CREATE TABLE IF NOT EXISTS correction_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  record_id INT NOT NULL,
  requested_changes JSON NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (record_id) REFERENCES clock_records(id)
);

-- 创建初始管理员用户 (密码: admin123)
INSERT INTO users (username, password, email, full_name, role, status) VALUES
('admin', '$2a$10$d6KCAY/x7nkBwqg5qyb/H.Zd.fhOVfbpDvQi/uNH5S1F/WzcH8nxu', 'admin@example.com', 'Admin User', 'admin', 'active');

-- 创建manager用户 (admin角色)
INSERT INTO users (username, password, email, full_name, role, status) VALUES
('manager', '$2a$10$d6KCAY/x7nkBwqg5qyb/H.Zd.fhOVfbpDvQi/uNH5S1F/WzcH8nxu', 'manager@example.com', 'Manager User', 'admin', 'active');

-- 创建yaosong用户 (普通用户角色)
INSERT INTO users (username, password, email, full_name, role, status) VALUES
('yaosong+1216', '$2a$10$d6KCAY/x7nkBwqg5qyb/H.Zd.fhOVfbpDvQi/uNH5S1F/WzcH8nxu', 'yaosong@example.com', 'Yaosong User', 'user', 'active'); 