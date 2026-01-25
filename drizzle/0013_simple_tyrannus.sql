CREATE TABLE `contact_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`school_name` text NOT NULL,
	`contact_person` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`city` text NOT NULL,
	`message` text,
	`status` text DEFAULT 'new' NOT NULL,
	`notes` text,
	`assigned_to` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
