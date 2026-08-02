package com.athlon.authservice.dto;

public class LoginRequest {
	
    private String input;
    private String password;

    public String getInput() {
        return input;
    }
    public void setInput(String input) {
        this.input = input;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
}
