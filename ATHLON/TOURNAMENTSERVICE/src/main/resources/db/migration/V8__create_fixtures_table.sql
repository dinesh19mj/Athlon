CREATE TABLE IF NOT EXISTS tournament.fixtures (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    
    category_id BIGINT NOT NULL,
    category_uuid UUID NOT NULL,
    
    round_name VARCHAR(100) NOT NULL,
    round_number INT NOT NULL,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
