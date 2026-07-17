CREATE TABLE IF NOT EXISTS tournament.reports (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    tournament_id BIGINT NOT NULL,
    tournament_uuid UUID NOT NULL,
    
    report_type VARCHAR(100) NOT NULL,
    file_url VARCHAR(500),
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
