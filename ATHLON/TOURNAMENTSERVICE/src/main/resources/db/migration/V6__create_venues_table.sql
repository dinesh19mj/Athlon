CREATE TABLE IF NOT EXISTS tournament.venues (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city_id BIGINT,
    city_uuid UUID,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
