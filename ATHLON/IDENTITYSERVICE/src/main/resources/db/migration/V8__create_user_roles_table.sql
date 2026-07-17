CREATE TABLE IF NOT EXISTS identity.user_roles (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    user_uuid UUID NOT NULL,
    role_id BIGINT NOT NULL,
    role_uuid UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);
