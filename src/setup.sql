-- Organizations table
CREATE TABLE public.organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- Service Projects table
CREATE TABLE public.project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES public.organization(organization_id)
);

-- Categories table
CREATE TABLE public.category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL
);

-- Junction table: projects <-> categories (many-to-many)
CREATE TABLE public.project_category (
    project_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, category_id),
    FOREIGN KEY (project_id) REFERENCES public.project(project_id),
    FOREIGN KEY (category_id) REFERENCES public.category(category_id)
);

-- Insert Organizations
INSERT INTO public.organization (name, description, contact_email, logo_filename) VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');

-- Insert Projects (5 per organization = 15 total)
INSERT INTO public.project (organization_id, title, description, location, date) VALUES
(1, 'Community Center Renovation', 'Renovating the downtown community center roof and flooring.', 'Downtown Phoenix, AZ', '2026-06-10'),
(1, 'Affordable Housing Build', 'Building 3 affordable homes for low-income families.', 'Mesa, AZ', '2026-07-15'),
(1, 'School Playground Installation', 'Installing a new accessible playground at Lincoln Elementary.', 'Tempe, AZ', '2026-08-01'),
(1, 'Park Bench Restoration', 'Restoring 20 park benches throughout Riverside Park.', 'Riverside, AZ', '2026-05-20'),
(1, 'Senior Center Ramp Build', 'Building wheelchair ramps at the Sunrise Senior Center.', 'Scottsdale, AZ', '2026-09-05'),
(2, 'Urban Garden Launch', 'Establishing a community vegetable garden in the west side neighborhood.', 'West Phoenix, AZ', '2026-06-01'),
(2, 'School Composting Program', 'Setting up composting systems at 5 local elementary schools.', 'Phoenix, AZ', '2026-07-10'),
(2, 'Farmers Market Setup', 'Organizing a weekly neighborhood farmers market.', 'Chandler, AZ', '2026-05-30'),
(2, 'Hydroponic Workshop', 'Teaching hydroponic farming techniques to 30 community members.', 'Gilbert, AZ', '2026-08-15'),
(2, 'Food Forest Planting', 'Planting 50 fruit trees in a public food forest.', 'Peoria, AZ', '2026-09-20'),
(3, 'Clothing Drive', 'Collecting and distributing clothing to 200 families in need.', 'Glendale, AZ', '2026-06-05'),
(3, 'Soup Kitchen Support', 'Volunteering at the Hope Soup Kitchen every Saturday for a month.', 'Phoenix, AZ', '2026-06-07'),
(3, 'Blood Drive Coordination', 'Organizing a community blood drive with 100+ donors.', 'Surprise, AZ', '2026-07-20'),
(3, 'Literacy Tutoring', 'Providing weekly reading tutoring to 40 adults.', 'Avondale, AZ', '2026-08-10'),
(3, 'Park Cleanup Day', 'Coordinating 50 volunteers to clean up Desert Park.', 'Buckeye, AZ', '2026-05-25');

-- Insert Categories
INSERT INTO public.category (name) VALUES
('Environmental'),
('Educational'),
('Community Service'),
('Health and Wellness');

-- Associate projects with categories
INSERT INTO public.project_category (project_id, category_id) VALUES
(1, 3), -- Community Center -> Community Service
(2, 3), -- Affordable Housing -> Community Service
(3, 2), -- School Playground -> Educational
(3, 3), -- School Playground -> Community Service
(4, 3), -- Park Benches -> Community Service
(5, 4), -- Senior Center Ramp -> Health and Wellness
(5, 3), -- Senior Center Ramp -> Community Service
(6, 1), -- Urban Garden -> Environmental
(6, 3), -- Urban Garden -> Community Service
(7, 1), -- Composting -> Environmental
(7, 2), -- Composting -> Educational
(8, 1), -- Farmers Market -> Environmental
(8, 3), -- Farmers Market -> Community Service
(9, 2), -- Hydroponic Workshop -> Educational
(9, 1), -- Hydroponic Workshop -> Environmental
(10, 1), -- Food Forest -> Environmental
(11, 3), -- Clothing Drive -> Community Service
(12, 3), -- Soup Kitchen -> Community Service
(12, 4), -- Soup Kitchen -> Health and Wellness
(13, 4), -- Blood Drive -> Health and Wellness
(13, 3), -- Blood Drive -> Community Service
(14, 2), -- Literacy Tutoring -> Educational
(15, 1), -- Park Cleanup -> Environmental
(15, 3); -- Park Cleanup -> Community Service

-- ─── Roles table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT
);

-- Seed initial roles
INSERT INTO roles (role_name, role_description) VALUES
    ('user',  'Standard user with basic access'),
    ('admin', 'Administrator with full system access')
ON CONFLICT (role_name) DO NOTHING;

-- ─── Users table ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INTEGER REFERENCES roles(role_id),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Organizations table ───────────────────────────────────────────────────────
CREATE TABLE public.organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- Service Projects table
CREATE TABLE public.project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES public.organization(organization_id)
);

-- Categories table
CREATE TABLE public.category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL
);

-- Junction table: projects <-> categories (many-to-many)
CREATE TABLE public.project_category (
    project_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, category_id),
    FOREIGN KEY (project_id) REFERENCES public.project(project_id),
    FOREIGN KEY (category_id) REFERENCES public.category(category_id)
);

-- Insert Organizations
INSERT INTO public.organization (name, description, contact_email, logo_filename) VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');

-- Insert Projects (5 per organization = 15 total)
INSERT INTO public.project (organization_id, title, description, location, date) VALUES
(1, 'Community Center Renovation', 'Renovating the downtown community center roof and flooring.', 'Downtown Phoenix, AZ', '2026-06-10'),
(1, 'Affordable Housing Build', 'Building 3 affordable homes for low-income families.', 'Mesa, AZ', '2026-07-15'),
(1, 'School Playground Installation', 'Installing a new accessible playground at Lincoln Elementary.', 'Tempe, AZ', '2026-08-01'),
(1, 'Park Bench Restoration', 'Restoring 20 park benches throughout Riverside Park.', 'Riverside, AZ', '2026-05-20'),
(1, 'Senior Center Ramp Build', 'Building wheelchair ramps at the Sunrise Senior Center.', 'Scottsdale, AZ', '2026-09-05'),
(2, 'Urban Garden Launch', 'Establishing a community vegetable garden in the west side neighborhood.', 'West Phoenix, AZ', '2026-06-01'),
(2, 'School Composting Program', 'Setting up composting systems at 5 local elementary schools.', 'Phoenix, AZ', '2026-07-10'),
(2, 'Farmers Market Setup', 'Organizing a weekly neighborhood farmers market.', 'Chandler, AZ', '2026-05-30'),
(2, 'Hydroponic Workshop', 'Teaching hydroponic farming techniques to 30 community members.', 'Gilbert, AZ', '2026-08-15'),
(2, 'Food Forest Planting', 'Planting 50 fruit trees in a public food forest.', 'Peoria, AZ', '2026-09-20'),
(3, 'Clothing Drive', 'Collecting and distributing clothing to 200 families in need.', 'Glendale, AZ', '2026-06-05'),
(3, 'Soup Kitchen Support', 'Volunteering at the Hope Soup Kitchen every Saturday for a month.', 'Phoenix, AZ', '2026-06-07'),
(3, 'Blood Drive Coordination', 'Organizing a community blood drive with 100+ donors.', 'Surprise, AZ', '2026-07-20'),
(3, 'Literacy Tutoring', 'Providing weekly reading tutoring to 40 adults.', 'Avondale, AZ', '2026-08-10'),
(3, 'Park Cleanup Day', 'Coordinating 50 volunteers to clean up Desert Park.', 'Buckeye, AZ', '2026-05-25');

-- Insert Categories
INSERT INTO public.category (name) VALUES
('Environmental'),
('Educational'),
('Community Service'),
('Health and Wellness');

-- Associate projects with categories
INSERT INTO public.project_category (project_id, category_id) VALUES
(1, 3), (2, 3), (3, 2), (3, 3), (4, 3),
(5, 4), (5, 3), (6, 1), (6, 3), (7, 1),
(7, 2), (8, 1), (8, 3), (9, 2), (9, 1),
(10, 1), (11, 3), (12, 3), (12, 4), (13, 4),
(13, 3), (14, 2), (15, 1), (15, 3);

-- ─── Admin account setup ───────────────────────────────────────────────────────
-- After running this file, register admin@example.com via the website UI,
-- then run this UPDATE to elevate the role:
--
-- UPDATE users
--   SET role_id = (SELECT role_id FROM roles WHERE role_name = 'admin')
--   WHERE email = 'admin@example.com';