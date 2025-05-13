-- 导入备份数据
SOURCE /docker-entrypoint-initdb.d/clockingapp_backup.sql;

-- 确保yaosong+1216用户具有admin权限（如果需要）
-- UPDATE users SET role = 'admin' WHERE username = 'yaosong+1216'; 