CREATE TABLE `schools1` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`name` text NOT NULL,
	`establishment_year` integer,
	`school_type` text,
	`k12_level` text,
	`board` text NOT NULL,
	`gender` text,
	`is_international` integer DEFAULT false,
	`streams_available` text,
	`languages` text,
	`total_students` text,
	`total_teachers` integer,
	`logo_url` text,
	`about_school` text,
	`banner_image_url` text,
	`address` text,
	`city` text NOT NULL,
	`state` text,
	`country` text,
	`website` text,
	`contact_number` text,
	`whatsapp_number` text,
	`email` text,
	`facebook_url` text,
	`instagram_url` text,
	`linkedin_url` text,
	`youtube_url` text,
	`google_map_url` text,
	`pincode` text,
	`medium` text,
	`classes_offered` text,
	`contact_email` text,
	`contact_phone` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `schools2` (
	`id` integer PRIMARY KEY NOT NULL,
	`classroom_type` text,
	`has_library` integer DEFAULT false,
	`has_computer_lab` integer DEFAULT false,
	`computer_count` integer,
	`has_physics_lab` integer DEFAULT false,
	`has_chemistry_lab` integer DEFAULT false,
	`has_biology_lab` integer DEFAULT false,
	`has_maths_lab` integer DEFAULT false,
	`has_language_lab` integer DEFAULT false,
	`has_robotics_lab` integer DEFAULT false,
	`has_stem_lab` integer DEFAULT false,
	`has_auditorium` integer DEFAULT false,
	`has_playground` integer DEFAULT false,
	`sports_facilities` text,
	`has_swimming_pool` integer DEFAULT false,
	`has_fitness_centre` integer DEFAULT false,
	`has_yoga` integer DEFAULT false,
	`has_martial_arts` integer DEFAULT false,
	`has_music_dance` integer DEFAULT false,
	`has_horse_riding` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `schools3` (
	`id` integer PRIMARY KEY NOT NULL,
	`has_smart_board` integer DEFAULT false,
	`has_wifi` integer DEFAULT false,
	`has_cctv` integer DEFAULT false,
	`has_elearning` integer DEFAULT false,
	`has_ac_classrooms` integer DEFAULT false,
	`has_ai_tools` integer DEFAULT false,
	`has_transport` integer DEFAULT false,
	`has_gps_buses` integer DEFAULT false,
	`has_cctv_buses` integer DEFAULT false,
	`has_bus_caretaker` integer DEFAULT false,
	`has_medical_room` integer DEFAULT false,
	`has_doctor_nurse` integer DEFAULT false,
	`has_fire_safety` integer DEFAULT false,
	`has_clean_water` integer DEFAULT false,
	`has_security_guards` integer DEFAULT false,
	`has_air_purifier` integer DEFAULT false,
	`has_hostel` integer DEFAULT false,
	`has_mess` integer DEFAULT false,
	`has_hostel_study_room` integer DEFAULT false,
	`has_ac_hostel` integer DEFAULT false,
	`has_cafeteria` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `schools4` (
	`id` integer PRIMARY KEY NOT NULL,
	`gallery_images` text,
	`virtual_tour_url` text,
	`virtual_tour_videos` text,
	`prospectus_url` text,
	`awards` text,
	`newsletter_url` text,
	`fees_structure` text,
	`facility_images` text,
	`logo` text,
	`banner_image` text,
	`student_teacher_ratio` text,
	`fees_min` integer,
	`fees_max` integer,
	`facilities` text,
	`description` text,
	`gallery` text,
	`rating` real DEFAULT 0,
	`review_count` integer DEFAULT 0,
	`profile_views` integer DEFAULT 0,
	`featured` integer DEFAULT false,
	`is_public` integer DEFAULT true,
	`latitude` real,
	`longitude` real,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
DROP TABLE `schools`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_alumni` (
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
	FOREIGN KEY (`school_id`) REFERENCES `schools1`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_alumni`("id", "school_id", "name", "batch_year", "class_level", "section", "current_position", "company", "achievements", "photo_url", "linkedin_url", "quote", "featured", "display_order", "created_at", "updated_at") SELECT "id", "school_id", "name", "batch_year", "class_level", "section", "current_position", "company", "achievements", "photo_url", "linkedin_url", "quote", "featured", "display_order", "created_at", "updated_at" FROM `alumni`;--> statement-breakpoint
DROP TABLE `alumni`;--> statement-breakpoint
ALTER TABLE `__new_alumni` RENAME TO `alumni`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_enquiries` (
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
	FOREIGN KEY (`school_id`) REFERENCES `schools1`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_enquiries`("id", "student_id", "school_id", "student_name", "student_email", "student_phone", "student_class", "message", "status", "notes", "follow_up_date", "created_at", "updated_at") SELECT "id", "student_id", "school_id", "student_name", "student_email", "student_phone", "student_class", "message", "status", "notes", "follow_up_date", "created_at", "updated_at" FROM `enquiries`;--> statement-breakpoint
DROP TABLE `enquiries`;--> statement-breakpoint
ALTER TABLE `__new_enquiries` RENAME TO `enquiries`;--> statement-breakpoint
CREATE TABLE `__new_news` (
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
	FOREIGN KEY (`school_id`) REFERENCES `schools1`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_news`("id", "school_id", "title", "content", "category", "publish_date", "images", "is_published", "featured", "created_at", "updated_at") SELECT "id", "school_id", "title", "content", "category", "publish_date", "images", "is_published", "featured", "created_at", "updated_at" FROM `news`;--> statement-breakpoint
DROP TABLE `news`;--> statement-breakpoint
ALTER TABLE `__new_news` RENAME TO `news`;--> statement-breakpoint
CREATE TABLE `__new_results` (
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
	FOREIGN KEY (`school_id`) REFERENCES `schools1`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_results`("id", "school_id", "year", "exam_type", "class_level", "pass_percentage", "total_students", "distinction", "first_class", "toppers", "achievements", "certificate_images", "created_at", "updated_at") SELECT "id", "school_id", "year", "exam_type", "class_level", "pass_percentage", "total_students", "distinction", "first_class", "toppers", "achievements", "certificate_images", "created_at", "updated_at" FROM `results`;--> statement-breakpoint
DROP TABLE `results`;--> statement-breakpoint
ALTER TABLE `__new_results` RENAME TO `results`;--> statement-breakpoint
CREATE TABLE `__new_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`school_id` integer NOT NULL,
	`rating` integer NOT NULL,
	`review_text` text NOT NULL,
	`photos` text,
	`approval_status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `schools1`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_reviews`("id", "user_id", "school_id", "rating", "review_text", "photos", "approval_status", "created_at", "updated_at") SELECT "id", "user_id", "school_id", "rating", "review_text", "photos", "approval_status", "created_at", "updated_at" FROM `reviews`;--> statement-breakpoint
DROP TABLE `reviews`;--> statement-breakpoint
ALTER TABLE `__new_reviews` RENAME TO `reviews`;--> statement-breakpoint
CREATE TABLE `__new_site_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`spotlight_school_id` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`spotlight_school_id`) REFERENCES `schools1`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_site_settings`("id", "spotlight_school_id", "created_at", "updated_at") SELECT "id", "spotlight_school_id", "created_at", "updated_at" FROM `site_settings`;--> statement-breakpoint
DROP TABLE `site_settings`;--> statement-breakpoint
ALTER TABLE `__new_site_settings` RENAME TO `site_settings`;