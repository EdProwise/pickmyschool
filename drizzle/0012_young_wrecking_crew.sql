CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`recipient_id` integer NOT NULL,
	`recipient_type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`type` text NOT NULL,
	`related_id` integer,
	`is_read` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `student_achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`school_id` integer NOT NULL,
	`year` integer NOT NULL,
	`student_name` text NOT NULL,
	`marks` text,
	`class_level` text NOT NULL,
	`section` text,
	`achievement` text NOT NULL,
	`images` text,
	`featured` integer DEFAULT false,
	`display_order` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools1`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `news` ADD `link` text;--> statement-breakpoint
ALTER TABLE `news` ADD `pdf` text;--> statement-breakpoint
ALTER TABLE `news` ADD `video` text;