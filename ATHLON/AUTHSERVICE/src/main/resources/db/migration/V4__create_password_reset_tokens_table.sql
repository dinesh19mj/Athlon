CREATE TABLE auth.password_reset_tokens (
    id UUID PRIMARY KEY,
    credentials_id UUID NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_pwd_reset_credentials FOREIGN KEY (credentials_id) REFERENCES auth.credentials (id) ON DELETE CASCADE
);
