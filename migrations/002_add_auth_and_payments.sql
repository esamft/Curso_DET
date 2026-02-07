-- =====================================================
-- DET Flow - Authentication and Payment System Migration
-- =====================================================
-- Version: 1.1.0
-- Date: 2025-02-07
-- Description: Adds authentication, subscriptions, and payment tracking
-- =====================================================

-- =====================================================
-- Update users table with authentication fields
-- =====================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

-- Subscription fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'expired'
    CHECK (subscription_status IN ('active', 'expired', 'cancelled', 'pending', 'trial'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20)
    CHECK (subscription_plan IN ('weekly', 'monthly', 'yearly'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT FALSE;

-- Additional profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);  -- For Brazilian CPF
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'BR';

-- Referral and tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(is_email_verified);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_end_date ON users(subscription_end_date);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- =====================================================
-- Table: payments
-- Stores all payment transactions
-- =====================================================

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Payment details
    payment_id VARCHAR(255) UNIQUE,  -- External payment provider ID
    provider VARCHAR(50) DEFAULT 'mercadopago' CHECK (provider IN ('mercadopago', 'stripe', 'manual')),

    -- Amount and currency
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',

    -- Subscription details
    subscription_plan VARCHAR(20) NOT NULL CHECK (subscription_plan IN ('weekly', 'monthly', 'yearly')),

    -- Status
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'cancelled', 'refunded', 'charged_back')),
    status_detail VARCHAR(100),

    -- Payment method
    payment_method VARCHAR(50),  -- pix, credit_card, debit_card, etc.
    payment_method_id VARCHAR(100),

    -- PIX specific fields
    pix_qr_code TEXT,
    pix_qr_code_base64 TEXT,
    pix_expiration_date TIMESTAMPTZ,

    -- Metadata
    external_reference VARCHAR(255),
    description TEXT,
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    -- Receipt and invoice
    receipt_url VARCHAR(512),
    invoice_id VARCHAR(255)
);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider);

-- =====================================================
-- Table: subscription_history
-- Tracks subscription changes over time
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Subscription details
    plan VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,

    -- Dates
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,

    -- Change reason
    action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'renewed', 'upgraded', 'downgraded', 'cancelled', 'expired', 'trial_started', 'trial_converted')),
    reason TEXT,

    -- Payment reference
    payment_id INTEGER REFERENCES payments(id),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON subscription_history(created_at DESC);

-- =====================================================
-- Table: webhook_events
-- Logs all webhook notifications from payment providers
-- =====================================================

CREATE TABLE IF NOT EXISTS webhook_events (
    id SERIAL PRIMARY KEY,

    -- Provider info
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,

    -- Event data
    payload JSONB NOT NULL,
    headers JSONB,

    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    error TEXT,

    -- Related entities
    payment_id INTEGER REFERENCES payments(id),
    user_id INTEGER REFERENCES users(id),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- =====================================================
-- Table: admin_users
-- Separate table for admin/staff accounts
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),

    -- Permissions
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'support', 'analyst')),
    permissions JSONB DEFAULT '[]'::jsonb,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- =====================================================
-- Table: admin_activity_log
-- Logs all admin actions for audit trail
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_activity_log (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,

    -- Action details
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),  -- users, payments, submissions, etc.
    entity_id INTEGER,

    -- Details
    description TEXT,
    changes JSONB,  -- Before/after values

    -- Request info
    ip_address INET,
    user_agent TEXT,

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON admin_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_entity ON admin_activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);

-- =====================================================
-- Triggers for updated_at timestamps
-- =====================================================

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Views for Analytics and Reporting
-- =====================================================

-- View: Active Subscribers
CREATE OR REPLACE VIEW active_subscribers AS
SELECT
    u.id,
    u.email,
    u.full_name,
    u.phone_number,
    u.subscription_plan,
    u.subscription_start_date,
    u.subscription_end_date,
    (u.subscription_end_date - NOW()) AS days_remaining,
    u.total_submissions,
    COUNT(p.id) AS total_payments,
    SUM(p.amount) AS total_revenue
FROM
    users u
    LEFT JOIN payments p ON u.id = p.user_id AND p.status = 'approved'
WHERE
    u.subscription_status = 'active'
    AND u.subscription_end_date > NOW()
GROUP BY
    u.id;

-- View: Revenue Summary
CREATE OR REPLACE VIEW revenue_summary AS
SELECT
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS total_transactions,
    COUNT(*) FILTER (WHERE status = 'approved') AS successful_transactions,
    SUM(amount) FILTER (WHERE status = 'approved') AS total_revenue,
    AVG(amount) FILTER (WHERE status = 'approved') AS average_transaction,
    subscription_plan,
    payment_method
FROM
    payments
GROUP BY
    DATE_TRUNC('day', created_at), subscription_plan, payment_method
ORDER BY
    date DESC;

-- View: User Lifetime Value
CREATE OR REPLACE VIEW user_lifetime_value AS
SELECT
    u.id AS user_id,
    u.email,
    u.created_at AS registration_date,
    COUNT(p.id) AS total_purchases,
    SUM(p.amount) FILTER (WHERE p.status = 'approved') AS lifetime_value,
    COUNT(DISTINCT DATE_TRUNC('month', p.created_at)) AS months_active,
    u.subscription_status,
    u.referred_by
FROM
    users u
    LEFT JOIN payments p ON u.id = p.user_id
GROUP BY
    u.id;

-- View: Subscription Churn Rate
CREATE OR REPLACE VIEW subscription_churn AS
SELECT
    DATE_TRUNC('month', created_at) AS month,
    action,
    COUNT(*) AS count
FROM
    subscription_history
WHERE
    action IN ('cancelled', 'expired', 'renewed')
GROUP BY
    DATE_TRUNC('month', created_at), action
ORDER BY
    month DESC;

-- =====================================================
-- Functions
-- =====================================================

-- Function: Check if user has access
CREATE OR REPLACE FUNCTION user_has_access(user_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    sub_status VARCHAR(20);
    sub_end_date TIMESTAMPTZ;
BEGIN
    SELECT subscription_status, subscription_end_date
    INTO sub_status, sub_end_date
    FROM users
    WHERE id = user_id_param;

    IF sub_status = 'active' AND sub_end_date > NOW() THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function: Process payment approval
CREATE OR REPLACE FUNCTION process_payment_approval(payment_id_param INTEGER)
RETURNS VOID AS $$
DECLARE
    payment_record RECORD;
    sub_end_date TIMESTAMPTZ;
BEGIN
    -- Get payment details
    SELECT * INTO payment_record FROM payments WHERE id = payment_id_param;

    -- Calculate subscription end date
    CASE payment_record.subscription_plan
        WHEN 'weekly' THEN
            sub_end_date := NOW() + INTERVAL '7 days';
        WHEN 'monthly' THEN
            sub_end_date := NOW() + INTERVAL '30 days';
        WHEN 'yearly' THEN
            sub_end_date := NOW() + INTERVAL '365 days';
    END CASE;

    -- Update user subscription
    UPDATE users
    SET
        subscription_status = 'active',
        subscription_plan = payment_record.subscription_plan,
        subscription_start_date = NOW(),
        subscription_end_date = sub_end_date,
        subscription_tier = 'premium',
        updated_at = NOW()
    WHERE id = payment_record.user_id;

    -- Log subscription history
    INSERT INTO subscription_history (user_id, plan, status, start_date, end_date, action, payment_id)
    VALUES (
        payment_record.user_id,
        payment_record.subscription_plan,
        'active',
        NOW(),
        sub_end_date,
        'renewed',
        payment_id_param
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Expire old subscriptions (run daily via cron)
CREATE OR REPLACE FUNCTION expire_old_subscriptions()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    WITH updated AS (
        UPDATE users
        SET
            subscription_status = 'expired',
            updated_at = NOW()
        WHERE
            subscription_status = 'active'
            AND subscription_end_date < NOW()
        RETURNING id, subscription_plan
    )
    INSERT INTO subscription_history (user_id, plan, status, start_date, end_date, action)
    SELECT id, subscription_plan, 'expired', subscription_end_date, NOW(), 'expired'
    FROM updated, users
    WHERE users.id = updated.id;

    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Insert default admin user (change password after first login!)
-- =====================================================

-- INSERT INTO admin_users (email, password_hash, full_name, role)
-- VALUES (
--     'admin@detflow.com',
--     -- Password: admin123 (CHANGE THIS IMMEDIATELY!)
--     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqCfnZUq/.lq',
--     'Administrator',
--     'super_admin'
-- );

-- =====================================================
-- Completion Message
-- =====================================================

COMMENT ON SCHEMA public IS 'DET Flow Schema Version 1.1.0 - Auth & Payments';

SELECT 'Authentication and payment system migration completed successfully!' AS message;
