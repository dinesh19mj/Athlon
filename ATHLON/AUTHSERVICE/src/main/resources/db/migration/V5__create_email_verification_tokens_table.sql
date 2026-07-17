CREATE TABLE auth.email_verification_tokens (
    id UUID PRIMARY KEY,
    credentials_id UUID NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    CONSTRAINT fk_email_verif_credentials FOREIGN KEY (credentials_id) REFERENCES auth.credentials (id) ON DELETE CASCADE
);
