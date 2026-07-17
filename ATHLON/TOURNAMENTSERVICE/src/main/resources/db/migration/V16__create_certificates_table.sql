CREATE TABLE IF NOT EXISTS tournament.certificates (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    registration_id BIGINT NOT NULL,
    registration_uuid UUID NOT NULL,
    
    player_id BIGINT,
    player_uuid UUID,
    
    certificate_type VARCHAR(100) NOT NULL,
    file_url VARCHAR(500),
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
