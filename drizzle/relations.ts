import { relations } from "drizzle-orm/relations";
import { users, chats, schools, enquiries, siteSettings, reviews, results, alumni, news } from "./schema";

export const chatsRelations = relations(chats, ({one}) => ({
	user: one(users, {
		fields: [chats.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	chats: many(chats),
	enquiries: many(enquiries),
	schools: many(schools),
	reviews: many(reviews),
}));

export const enquiriesRelations = relations(enquiries, ({one}) => ({
	school: one(schools, {
		fields: [enquiries.schoolId],
		references: [schools.id]
	}),
	user: one(users, {
		fields: [enquiries.studentId],
		references: [users.id]
	}),
}));

export const schoolsRelations = relations(schools, ({one, many}) => ({
	enquiries: many(enquiries),
	user: one(users, {
		fields: [schools.userId],
		references: [users.id]
	}),
	siteSettings: many(siteSettings),
	reviews: many(reviews),
	results: many(results),
	alumni: many(alumni),
	news: many(news),
}));

export const siteSettingsRelations = relations(siteSettings, ({one}) => ({
	school: one(schools, {
		fields: [siteSettings.spotlightSchoolId],
		references: [schools.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	school: one(schools, {
		fields: [reviews.schoolId],
		references: [schools.id]
	}),
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id]
	}),
}));

export const resultsRelations = relations(results, ({one}) => ({
	school: one(schools, {
		fields: [results.schoolId],
		references: [schools.id]
	}),
}));

export const alumniRelations = relations(alumni, ({one}) => ({
	school: one(schools, {
		fields: [alumni.schoolId],
		references: [schools.id]
	}),
}));

export const newsRelations = relations(news, ({one}) => ({
	school: one(schools, {
		fields: [news.schoolId],
		references: [schools.id]
	}),
}));