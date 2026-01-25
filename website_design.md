<user_request>Create a fully responsive, modern, elegant, and attractive web application called "PickMySchool". It should work as:

A school discovery platform for students/parents, similar in structure and information architecture to https://www.schoolsuniverse.com
 (use it as a design and UX reference, not a pixel-perfect copy).

A CRM system for schools to manage leads, enquiries, and communication.

Design & Branding

Primary theme color: #04d3d3 (use in buttons, highlights, accents).

Overall look: clean, modern, minimal, and professional, with good use of whitespace.

Fully responsive for desktop, tablet, and mobile.

Tech Stack

Frontend: Next.js (React) + Tailwind CSS (or another modern CSS utility framework).

Backend: Node.js + Express (or NestJS) with a RESTful API.

Database: MongoDB or PostgreSQL.

Connect frontend and backend fully (no dummy UI).

Core Features
1. Public Website (Student/Parent Side)

Homepage inspired by schoolsuniverse.com, including:

Hero section with search bar: search by city/area, board (CBSE/ICSE/etc.), class, budget, and type (day school, boarding, etc.).

Sections like: "How PickMySchool Works", featured schools, top cities, testimonials, and CTAs ("Find a School", "List Your School").

School Search & Listing Page:

Filters for city, board, fees range, facilities, rating, etc.

Card layout for schools with name, logo, location, board, fees range, key highlights, "View Details" and "Chat Now".

School Details Page:

School name, logo, banner image, address (with map placeholder), contact info.

Basic info: board, medium, classes offered, establishment year, student-teacher ratio.

Tabs/sections: Overview, Facilities, Gallery, Fees, Reviews, Location, Contact.

"Enquire Now" form + "Save School" + "Chat with AI" button.

Authentication & User Roles

Implement email-based login and signup with password and JWT/session auth.

Roles:

Student/Parent

School

Auth Pages

Login Page:

Email, password, role selector (Student/Parent or School).

"Forgot Password" link.

Signup Page:

For Students: name, email, phone (optional), password, city, class.

For Schools: school name, admin name, email, phone, password, city, board.

Proper form validation and error messages.

Dashboards

Use the attached school dashboard design as a visual reference for style and layout.

Student Dashboard

After login as Student/Parent, show a dashboard with:

Welcome header and quick stats (Saved Schools, Enquiries, Chats).

Sections/Pages:

My Profile – view/update basic details.

Saved Schools – list of bookmarked schools.

My Enquiries – list of enquiries sent, with status and timestamps.

Chat History – previous AI chat threads about schools.

Recommended schools based on their preferences (can be simple rule-based for now).

School Dashboard (CRM)

After login as School, show a CRM-style dashboard:

Overview cards: Total Leads, New Enquiries, Follow-ups Due, Profile Views.

Sections/Pages:

School Profile Management – edit details, photos, fees, facilities, etc.

Leads & Enquiries – table of all enquiries from students with status (New, In Progress, Converted, Closed), notes, and follow-up date.

Chat with Students (AI-assisted log) – view chat context where AI has answered basic queries and surface leads.

Analytics – basic charts for enquiries by month, most viewed classes, etc. (can be sample/static data if needed).

AI-Based Chat System

Implement an AI-style chat system available in two places:

On the public side: on school details and search pages (e.g., "Ask about schools in my budget in Delhi").

Inside student and school dashboards as a support/chat assistant.

Requirements:

Chat UI similar to modern messengers: message bubbles, timestamps, typing indicator.

Student can ask queries like:

"Show CBSE schools under 50,000 fees in South Delhi"

"Which schools have hostel facilities near Pune?"

For implementation:

Create a backend endpoint like /api/chat that:

Accepts user query and context (user role, filters, etc.).

Uses a mock or rule-based AI approach that:

Parses the query (basic keyword/intent extraction).

Searches the school database accordingly.

Returns a structured response and a list of matching schools.

Frontend should display the AI response and clickable school cards in the chat.

Backend Features & APIs

Build clean REST APIs for:

Auth:

POST /api/auth/signup (student, school)

POST /api/auth/login

GET /api/auth/me (get current user via token)

Schools:

GET /api/schools with filters (city, board, fees, etc.)

GET /api/schools/:id

POST /api/schools (for school admins to update profile)

PUT /api/schools/:id (restricted to school owner)

Enquiries & Leads:

POST /api/enquiries (student submits enquiry to a school)

GET /api/enquiries (student sees their enquiries)

GET /api/school/enquiries (school sees all leads)

PUT /api/school/enquiries/:id (update status, add notes)

Chat:

POST /api/chat (AI-style response and suggested schools)

GET /api/chat/history (per user)

Ensure:

Proper authentication & authorization per role.

Basic error handling and validation.

Seed data for a sample set of schools to demonstrate search and AI responses.

UX & Extra Details

Smooth micro-interactions and hover effects.

Sticky top navbar with logo "PickMySchool" and navigation: Home, Find Schools, For Schools, Login / Signup.

Footer with links: About, Contact, Privacy Policy, Terms, etc.

SEO-friendly meta tags and clean URL slugs for school pages.</user_request>

<todo_list>
1. Set up MongoDB database with User, School, Enquiry, and Chat models. Create REST API endpoints for authentication (signup/login with JWT), schools (CRUD with filters), enquiries, and AI chat system. Include seed data for 20+ sample schools across different cities and boards
2. Build public homepage with hero search section, "How It Works", featured schools carousel, top cities grid, and testimonials. Create school listing page with advanced filters and school detail pages with tabs for overview, facilities, gallery, fees, reviews, and enquire form
3. Implement authentication pages (login/signup with role selection) and create Student Dashboard with profile management, saved schools, enquiries tracking, chat history, and recommendations
4. Build School CRM Dashboard (styled per reference image) with analytics cards, leads/enquiries management table with status tracking, school profile editor, and conversion funnel visualization
5. Create AI chat system component with message bubbles UI, typing indicators, and integrate with backend chat API that parses queries and returns matching schools. Add chat widget to public pages and both dashboards with conversation history
</todo_list>