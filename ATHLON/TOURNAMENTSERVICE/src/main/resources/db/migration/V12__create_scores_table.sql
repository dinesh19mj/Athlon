CREATE TABLE IF NOT EXISTS tournament.scores (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    match_id BIGINT NOT NULL,
    match_uuid UUID NOT NULL,
    
    team_a_score VARCHAR(255),
    team_b_score VARCHAR(255),
    
    is_final BOOLEAN NOT NULL DEFAULT FALSE,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
