CREATE TABLE `chats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`role` text NOT NULL,
	`messages` text,
	`last_message_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`school_id` integer NOT NULL,
	`student_name` text NOT NULL,
	`student_email` text NOT NULL,
	`student_phone` text NOT NULL,
	`student_class` text NOT NULL,
	`message` text,
	`status` text DEFAULT 'New' NOT NULL,
	`notes` text,
	`follow_up_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`logo` text,
	`banner_image` text,
	`address` text,
	`city` text NOT NULL,
	`state` text,
	`pincode` text,
	`board` text NOT NULL,
	`medium` text,
	`classes_offered` text,
	`establishment_year` integer,
	`student_teacher_ratio` text,
	`school_type` text,
	`fees_min` integer,
	`fees_max` integer,
	`facilities` text,
	`description` text,
	`gallery` text,
	`contact_email` text,
	`contact_phone` text,
	`rating` real DEFAULT 0,
	`review_count` integer DEFAULT 0,
	`profile_views` integer DEFAULT 0,
	`featured` integer DEFAULT false,
	`latitude` real,
	`longitude` real,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`city` text,
	`class` text,
	`school_id` integer,
	`saved_schools` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);