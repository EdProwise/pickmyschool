-- Drop the tables that have invalid foreign keys
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS alumni;
DROP TABLE IF EXISTS news;

-- Recreate results table with correct foreign key
CREATE TABLE results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL REFERENCES schools1(id),
  year INTEGER NOT NULL,
  exam_type TEXT NOT NULL,
  class_level TEXT,
  pass_percentage REAL,
  total_students INTEGER,
  distinction INTEGER,
  first_class INTEGER,
  toppers TEXT,
  achievements TEXT,
  certificate_images TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Recreate alumni table with correct foreign key
CREATE TABLE alumni (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL REFERENCES schools1(id),
  name TEXT NOT NULL,
  batch_year INTEGER NOT NULL,
  class_level TEXT,
  section TEXT,
  current_position TEXT,
  company TEXT,
  achievements TEXT,
  photo_url TEXT,
  linkedin_url TEXT,
  quote TEXT,
  featured INTEGER DEFAULT 0,
  display_order INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Recreate news table with correct foreign key  
CREATE TABLE news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id INTEGER NOT NULL REFERENCES schools1(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  publish_date TEXT NOT NULL,
  images TEXT,
  is_published INTEGER DEFAULT 1,
  featured INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
