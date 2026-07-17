CREATE TABLE IF NOT EXISTS identity.organization_members (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    organization_id BIGINT NOT NULL,
    organization_uuid UUID NOT NULL,
    user_id BIGINT NOT NULL,
    user_uuid UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
