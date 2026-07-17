CREATE TABLE IF NOT EXISTS tournament.categories (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    tournament_id BIGINT NOT NULL,
    tournament_uuid UUID NOT NULL,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    sport_type VARCHAR(50) NOT NULL,
    match_format VARCHAR(50),
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
