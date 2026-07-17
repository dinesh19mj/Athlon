CREATE TABLE IF NOT EXISTS tournament.announcements (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    tournament_id BIGINT NOT NULL,
    tournament_uuid UUID NOT NULL,
    
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
