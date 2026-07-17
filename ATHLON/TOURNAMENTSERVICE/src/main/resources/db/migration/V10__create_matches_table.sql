CREATE TABLE IF NOT EXISTS tournament.matches (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    team_a_registration_id BIGINT,
    team_a_registration_uuid UUID,
    
    team_b_registration_id BIGINT,
    team_b_registration_uuid UUID,
    
    court_id BIGINT,
    court_uuid UUID,
    
    scheduled_time TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    
    winner_registration_id BIGINT,
    winner_registration_uuid UUID,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
