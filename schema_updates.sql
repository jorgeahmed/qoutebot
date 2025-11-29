-- QuoteBot Schema Updates for Cancellation System
-- This extends the existing schema to support job/quote cancellations and notifications

-- ============================================================================
-- 1. Extend jobs table with cancellation fields
-- ============================================================================
ALTER TABLE jobs ADD COLUMN cancelled_at TIMESTAMP;
ALTER TABLE jobs ADD COLUMN cancellation_reason TEXT;
ALTER TABLE jobs ADD COLUMN cancelled_by VARCHAR(255);

-- ============================================================================
-- 2. Create quotes/levantamientos table
-- ============================================================================
CREATE TABLE IF NOT EXISTS quotes (
    quote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    contractor_id VARCHAR(255) NOT NULL,
    contractor_name VARCHAR(255),
    contractor_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',  -- active, cancelled, accepted
    description TEXT,
    estimated_cost DECIMAL(10, 2),
    materials_cost DECIMAL(10, 2),
    labor_cost DECIMAL(10, 2),
    other_costs DECIMAL(10, 2),
    timeline_days INTEGER,
    timeline_description TEXT,
    guarantees TEXT,
    payment_terms TEXT,
    photo_keys TEXT,  -- JSON array of photo storage keys
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
);

-- ============================================================================
-- 3. Create notifications table
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- job_cancelled, quote_cancelled, quote_received, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id INTEGER,  -- job_id or quote_id
    related_type VARCHAR(50),  -- 'job' or 'quote'
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_quotes_job_id ON quotes(job_id);
CREATE INDEX IF NOT EXISTS idx_quotes_contractor_id ON quotes(contractor_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON notifications(read_status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
