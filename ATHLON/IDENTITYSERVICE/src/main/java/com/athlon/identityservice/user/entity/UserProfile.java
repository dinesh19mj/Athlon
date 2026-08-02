package com.athlon.identityservice.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userprofileid", updatable = false, nullable = false)
    private Long userProfileId;

    @Column(name = "userprofileuuid", updatable = false, nullable = false, unique = true)
    private UUID userProfileUuid;

    @Column(name = "userid", nullable = false)
    private Long userId;

    @Column(name = "useruuid", nullable = false)
    private UUID userUuid;

    @Column(name = "firstname", nullable = false, length = 100)
    private String firstName;

    @Column(name = "lastname", length = 100)
    private String lastName;

    @Column(name = "phone", length = 20)
    private String phone;

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

    public UserProfile() {
    }

    public UserProfile(Long userId, UUID userUuid, String firstName,
                       String lastName, String phone, Long createdBy) {
        this.userId = userId;
        this.userUuid = userUuid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.isActive = 1;
        this.createdBy = createdBy;
    }

    @PrePersist
    protected void onCreate() {
        if (this.userProfileUuid == null) {
            this.userProfileUuid = UUID.randomUUID();
        }
        this.createdOn = LocalDateTime.now();
        this.modifiedOn = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.modifiedOn = LocalDateTime.now();
    }

    public Long getUserProfileId() {
		return userProfileId;
	}

	public void setUserProfileId(Long userProfileId) {
		this.userProfileId = userProfileId;
	}

	public UUID getUserProfileUuid() {
		return userProfileUuid;
	}

	public void setUserProfileUuid(UUID userProfileUuid) {
		this.userProfileUuid = userProfileUuid;
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

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
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
        if (!(o instanceof UserProfile)) return false;
        UserProfile that = (UserProfile) o;
        return Objects.equals(userProfileId, that.userProfileId) &&
               Objects.equals(userProfileUuid, that.userProfileUuid) &&
               Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userProfileId, userProfileUuid, userId);
    }

    @Override
    public String toString() {
        return "UserProfile{" +
                "userProfileId=" + userProfileId +
                ", userProfileUuid=" + userProfileUuid +
                ", userId=" + userId +
                ", userUuid=" + userUuid +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", phone='" + phone + '\'' +
                ", isActive=" + isActive +
                ", createdOn=" + createdOn +
                ", modifiedOn=" + modifiedOn +
                ", createdBy=" + createdBy +
                ", modifiedBy=" + modifiedBy +
                '}';
    }
}