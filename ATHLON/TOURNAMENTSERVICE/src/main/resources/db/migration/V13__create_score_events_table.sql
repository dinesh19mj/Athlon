CREATE TABLE IF NOT EXISTS tournament.score_events (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    score_id BIGINT NOT NULL,
    score_uuid UUID NOT NULL,
    
    player_id BIGINT,
    player_uuid UUID,
    
    event_type VARCHAR(50) NOT NULL,
    event_value VARCHAR(255),
    event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
