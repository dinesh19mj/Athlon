package com.athlon.identityservice.user.entity;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userid", updatable = false, nullable = false)
    private Long userId;

    @Column(name = "useruuid", updatable = false, nullable = false, unique = true)
    private UUID userUuid;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "isactive", nullable = false)
    private Integer isActive;

    @Column(name = "createdon", nullable = false, updatable = false)
    private LocalDateTime createdOn;

    @Column(name = "modifiedon")
    private LocalDateTime modifiedOn;

    @Column(name = "createdby")
    private Long createdBy;

    @Column(name = "modifiedby")
    private Long modifiedBy;

    public User() {
    }

    public User(String email, Long createdBy) {
        this.email = email;
        this.isActive = 1;
        this.createdBy = createdBy;
    }

    public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public UUID getUserUuid() {
		return userUuid;
	}

	public void setUserUuid(UUID userUuid) {
		this.userUuid = userUuid;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Integer getIsActive() {
		return isActive;
	}

	public void setIsActive(Integer isActive) {
		this.isActive = isActive;
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

	public Long getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(Long createdBy) {
		this.createdBy = createdBy;
	}

	public Long getModifiedBy() {
		return modifiedBy;
	}

	public void setModifiedBy(Long modifiedBy) {
		this.modifiedBy = modifiedBy;
	}

	@Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(userId, user.userId) &&
                Objects.equals(userUuid, user.userUuid) &&
                Objects.equals(email, user.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, userUuid, email);
    }

    @PrePersist
    protected void onCreate() {
        if (this.userUuid == null) {
            this.userUuid = UUID.randomUUID();
        }
        this.createdOn = LocalDateTime.now();
        this.modifiedOn = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.modifiedOn = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", userUuid=" + userUuid +
                ", email='" + email + '\'' +
                ", isActive=" + isActive +
                ", createdOn=" + createdOn +
                ", modifiedOn=" + modifiedOn +
                ", createdBy=" + createdBy +
                ", modifiedBy=" + modifiedBy +
                '}';
    }
}
