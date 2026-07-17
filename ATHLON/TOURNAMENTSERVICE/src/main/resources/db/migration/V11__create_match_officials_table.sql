CREATE TABLE IF NOT EXISTS tournament.match_officials (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    match_id BIGINT NOT NULL,
    match_uuid UUID NOT NULL,
    
    official_id BIGINT NOT NULL,
    official_uuid UUID NOT NULL,
    
    role VARCHAR(50) NOT NULL,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
