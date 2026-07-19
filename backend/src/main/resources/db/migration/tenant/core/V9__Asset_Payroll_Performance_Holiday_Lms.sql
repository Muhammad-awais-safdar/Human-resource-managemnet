-- Phase 16: Regional Holiday Maps
CREATE TABLE IF NOT EXISTS regional_holiday (
    id VARCHAR(50) PRIMARY KEY,
    holiday_id VARCHAR(50) REFERENCES holiday(id) ON DELETE CASCADE,
    region VARCHAR(50) NOT NULL
);

-- Phase 18: Performance Peer Feedback Logs
CREATE TABLE IF NOT EXISTS peer_feedback (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employee(id) ON DELETE CASCADE,
    reviewer_hash VARCHAR(64) NOT NULL,
    feedback TEXT NOT NULL,
    rating INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Phase 19: Learning Course Curriculum & Quizzes
CREATE TABLE IF NOT EXISTS course_lesson (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES course(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    file_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS course_quiz (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES course(id) ON DELETE CASCADE,
    question VARCHAR(255) NOT NULL,
    correct_answer VARCHAR(100) NOT NULL
);

-- Phase 20: Asset Inventory & Warranties
CREATE TABLE IF NOT EXISTS asset_inventory (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    serial_code VARCHAR(50) UNIQUE NOT NULL,
    warranty_expiry DATE,
    status VARCHAR(30) DEFAULT 'AVAILABLE' NOT NULL
);
