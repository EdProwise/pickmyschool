CREATE TABLE `alumni` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`school_id` integer NOT NULL,
	`name` text NOT NULL,
	`batch_year` integer NOT NULL,
	`class_level` text,
	`section` text,
	`current_position` text,
	`company` text,
	`achievements` text,
	`photo_url` text,
	`linkedin_url` text,
	`quote` text,
	`featured` integer DEFAULT false,
	`display_order` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`school_id` integer NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`category` text NOT NULL,
	`publish_date` text NOT NULL,
	`images` text,
	`is_published` integer DEFAULT true,
	`featured` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`school_id` integer NOT NULL,
	`year` integer NOT NULL,
	`exam_type` text NOT NULL,
	`class_level` text,
	`pass_percentage` real,
	`total_students` integer,
	`distinction` integer,
	`first_class` integer,
	`toppers` text,
	`achievements` text,
	`certificate_images` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE no action
);
