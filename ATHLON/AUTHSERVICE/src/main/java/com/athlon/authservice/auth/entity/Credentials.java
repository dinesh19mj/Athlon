package com.athlon.authservice.auth.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "credentials")
public class Credentials {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "credentialid", updatable = false, nullable = false)
    private Long credentialId;

    @Column(name = "credentialuuid", updatable = false, nullable = false, unique = true)
    private UUID credentialUuid;

    @Column(name = "useruuid", nullable = false)
    private UUID userUuid;

    @Column(name = "email", unique = true, length = 255)
    private String email;

    @Column(name = "phone", unique = true, length = 20)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "is_email_verified", nullable = false)
    private Integer isEmailVerified = 0;

    @Column(name = "is_account_locked", nullable = false)
    private Integer isAccountLocked = 0;

    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts;

    @Column(name = "createdon", nullable = false, updatable = false)
    private LocalDateTime createdOn;

    @Column(name = "modifiedon")
    private LocalDateTime modifiedOn;

	public Long getCredentialId() {
		return credentialId;
	}

	public void setCredentialId(Long credentialId) {
		this.credentialId = credentialId;
	}

	public UUID getCredentialUuid() {
		return credentialUuid;
	}

	public void setCredentialUuid(UUID credentialUuid) {
		this.credentialUuid = credentialUuid;
	}

    public UUID getUserUuid() { return userUuid; }
    public void setUserUuid(UUID userUuid) { this.userUuid = userUuid; }

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public boolean isEmailVerified() {
		return isEmailVerified != null && isEmailVerified == 1;
	}

	public void setEmailVerified(boolean isEmailVerified) {
		this.isEmailVerified = isEmailVerified ? 1 : 0;
	}

	public boolean isAccountLocked() {
		return isAccountLocked != null && isAccountLocked == 1;
	}

	public void setAccountLocked(boolean isAccountLocked) {
		this.isAccountLocked = isAccountLocked ? 1 : 0;
	}

	public int getFailedLoginAttempts() {
		return failedLoginAttempts;
	}

	public void setFailedLoginAttempts(int failedLoginAttempts) {
		this.failedLoginAttempts = failedLoginAttempts;
	}

	public LocalDateTime getCreatedOn() {
		return createdOn;
	}

	public void setCreatedOn(LocalDateTime createdOn) {
		this.createdOn = createdOn;
	}

	public LocalDateTime getModifiedOn() {
		return modifiedOn;
	}

	public void setModifiedOn(LocalDateTime modifiedOn) {
		this.modifiedOn = modifiedOn;
	}

}
