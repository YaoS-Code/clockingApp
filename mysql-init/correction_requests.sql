-- Create correction_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS `correction_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `record_id` int(11) NOT NULL,
  `original_clock_in` datetime NOT NULL,
  `original_clock_out` datetime DEFAULT NULL,
  `requested_clock_in` datetime NOT NULL,
  `requested_clock_out` datetime DEFAULT NULL,
  `original_break_minutes` int(11) DEFAULT NULL,
  `requested_break_minutes` int(11) DEFAULT NULL,
  `original_location` varchar(50) DEFAULT NULL,
  `requested_location` varchar(50) DEFAULT NULL,
  `reason` text NOT NULL,
  `admin_notes` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `record_id` (`record_id`),
  CONSTRAINT `correction_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `correction_requests_ibfk_2` FOREIGN KEY (`record_id`) REFERENCES `clock_records` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
