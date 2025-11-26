ALTER TABLE `schools` ADD `user_id` integer REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `schools` ADD `k12_level` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `gender` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `is_international` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `streams_available` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `languages` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `total_students` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `total_teachers` integer;--> statement-breakpoint
ALTER TABLE `schools` ADD `logo_url` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `country` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `website` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `contact_number` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `whatsapp_number` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `email` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `facebook_url` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `instagram_url` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `linkedin_url` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `youtube_url` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `google_map_url` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `classroom_type` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_library` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_computer_lab` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `computer_count` integer;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_physics_lab` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_chemistry_lab` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_biology_lab` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_maths_lab` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_language_lab` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_robotics_lab` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_stem_lab` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_auditorium` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_playground` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `sports_facilities` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_swimming_pool` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_fitness_centre` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_yoga` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_martial_arts` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_music_dance` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_horse_riding` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_smart_board` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_wifi` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_cctv` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_elearning` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_ac_classrooms` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_ai_tools` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_transport` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_gps_buses` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_cctv_buses` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_bus_caretaker` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_medical_room` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_doctor_nurse` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_fire_safety` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_clean_water` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_security_guards` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_air_purifier` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_hostel` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_mess` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_hostel_study_room` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_ac_hostel` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `has_cafeteria` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `schools` ADD `gallery_images` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `virtual_tour_url` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `prospectus_url` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `awards` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `newsletter_url` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `fees_structure` text;