CREATE TABLE IF NOT EXISTS tournament.tournaments (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    
    organizer_id BIGINT NOT NULL,
    organizer_uuid UUID NOT NULL,
    
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
