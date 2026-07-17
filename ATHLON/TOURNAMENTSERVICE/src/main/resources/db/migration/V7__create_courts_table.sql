CREATE TABLE IF NOT EXISTS tournament.courts (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    venue_id BIGINT NOT NULL,
    venue_uuid UUID NOT NULL,
    
    name VARCHAR(100) NOT NULL,
    sport_type VARCHAR(50),
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
