CREATE TABLE IF NOT EXISTS tournament.registrations (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    tournament_id BIGINT NOT NULL,
    tournament_uuid UUID NOT NULL,
    
    category_id BIGINT NOT NULL,
    category_uuid UUID NOT NULL,
    
    team_name VARCHAR(255),
    
    primary_contact_id BIGINT NOT NULL,
    primary_contact_uuid UUID NOT NULL,
    
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
