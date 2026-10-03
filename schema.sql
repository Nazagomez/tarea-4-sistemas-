CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  edition TEXT,
  copyright INTEGER,
  language TEXT,
  pages INTEGER,
  author TEXT,
  author_id INTEGER,
  publisher TEXT,
  publisher_id INTEGER
);

CREATE TABLE IF NOT EXISTS authors (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  nationality TEXT,
  birth_year INTEGER,
  fields TEXT,
  books TEXT
);

CREATE TABLE IF NOT EXISTS publishers (
  id TEXT PRIMARY KEY,
  publisher TEXT NOT NULL,
  country TEXT,
  founded INTEGER,
  genere TEXT,
  books TEXT
);

INSERT INTO books (id, title, edition, copyright, language, pages, author, author_id, publisher, publisher_id) VALUES
('1', 'Operating System Concepts', '9th', 2012, 'ENGLISH', 976, 'Abraham Silberschatz', 1, 'John Wiley & Sons', 1),
('2', 'Database System Concepts', '6th', 2010, 'ENGLISH', 1376, 'Abraham Silberschatz', 1, 'John Wiley & Sons', 1),
('3', 'Computer Networks', '5th', 2010, 'ENGLISH', 960, 'Andrew S. Tanenbaum', 2, 'Pearson Education', 2),
('4', 'Modern Operating Systems', '4th', 2014, 'ENGLISH', 1136, 'Andrew S. Tanenbaum', 2, 'Pearson Education', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO authors (id, author, nationality, birth_year, fields, books) VALUES
('1', 'Abraham Silberschatz', 'Israelis / American', 1952, 'Database Systems, Operating Systems',
 '[{"book_id":1,"title":"Operating System Concepts"},{"book_id":2,"title":"Database System Concepts"}]'),
('2', 'Andrew S. Tanenbaum', 'Dutch / American', 1944, 'Distributed computing, Operating Systems',
 '[{"book_id":3,"title":"Computer Networks"},{"book_id":4,"title":"Modern Operating Systems"}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO publishers (id, publisher, country, founded, genere, books) VALUES
('1', 'John Wiley & Sons', 'United States', 1807, 'Academic',
 '[{"book_id":1,"title":"Operating System Concepts"},{"book_id":2,"title":"Database System Concepts"}]'),
('2', 'Pearson Education', 'United Kingdom', 1844, 'Education',
 '[{"book_id":3,"title":"Computer Networks"},{"book_id":4,"title":"Modern Operating Systems"}]')
ON CONFLICT (id) DO NOTHING;
