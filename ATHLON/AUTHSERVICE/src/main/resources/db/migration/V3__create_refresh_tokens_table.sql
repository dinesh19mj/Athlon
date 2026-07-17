CREATE TABLE auth.refresh_tokens (
    id UUID PRIMARY KEY,
    credentials_id UUID NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_refresh_credentials FOREIGN KEY (credentials_id) REFERENCES auth.credentials (id) ON DELETE CASCADE
);
