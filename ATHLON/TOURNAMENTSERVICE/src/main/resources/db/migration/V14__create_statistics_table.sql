CREATE TABLE IF NOT EXISTS tournament.statistics (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    category_id BIGINT NOT NULL,
    category_uuid UUID NOT NULL,
    
    player_id BIGINT,
    player_uuid UUID,
    
    matches_played INT DEFAULT 0,
    matches_won INT DEFAULT 0,
    matches_lost INT DEFAULT 0,
    
    points INT DEFAULT 0,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
