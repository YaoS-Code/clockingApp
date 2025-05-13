-- 设置全局时区为温哥华时区 (UTC-7/UTC-8，取决于夏令时)
SET GLOBAL time_zone = '-07:00';
SET time_zone = '-07:00';

-- 告诉MySQL何时使用夏令时
-- 这需要MySQL时区表格被填充 
-- 如果 MySQL 时区表格已填充，则可以使用：
-- SET GLOBAL time_zone = 'America/Vancouver';
-- SET time_zone = 'America/Vancouver'; 