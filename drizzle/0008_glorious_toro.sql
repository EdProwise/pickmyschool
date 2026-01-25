CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`parent_name` text NOT NULL,
	`location` text NOT NULL,
	`rating` integer NOT NULL,
	`testimonial_text` text NOT NULL,
	`avatar_url` text,
	`featured` integer DEFAULT false,
	`display_order` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
