CREATE TABLE auth.login_history (
    id UUID PRIMARY KEY,
    credentials_id UUID NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    login_status VARCHAR(50) NOT NULL,
    login_time TIMESTAMP NOT NULL,
    CONSTRAINT fk_login_hist_credentials FOREIGN KEY (credentials_id) REFERENCES auth.credentials (id) ON DELETE CASCADE
);
