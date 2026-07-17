CREATE TABLE IF NOT EXISTS tournament.rankings (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    category_id BIGINT NOT NULL,
    category_uuid UUID NOT NULL,
    
    player_id BIGINT,
    player_uuid UUID,
    
    rank_position INT NOT NULL,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
