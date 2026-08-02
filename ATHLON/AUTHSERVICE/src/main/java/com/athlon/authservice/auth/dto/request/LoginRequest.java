package com.athlon.authservice.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
	@NotBlank(message = "Identifier (Email or Phone) is required")
	private String identifier;
	private String password;

	public LoginRequest() {
	}

	public String getIdentifier() {
		return identifier;
	}

	public void setIdentifier(String identifier) {
		this.identifier = identifier;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
}
