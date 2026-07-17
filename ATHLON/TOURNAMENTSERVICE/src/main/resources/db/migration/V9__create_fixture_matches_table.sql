CREATE TABLE IF NOT EXISTS tournament.fixture_matches (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    fixture_id BIGINT NOT NULL,
    fixture_uuid UUID NOT NULL,
    
    match_id BIGINT NOT NULL,
    match_uuid UUID NOT NULL,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
