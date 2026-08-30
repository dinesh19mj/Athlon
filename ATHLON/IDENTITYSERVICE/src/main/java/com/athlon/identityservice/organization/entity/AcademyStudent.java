package com.athlon.identityservice.organization.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
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
@Table(name = "academy_students")
public class AcademyStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id", updatable = false, nullable = false)
    private Long studentId;

    @Column(name = "student_uuid", updatable = false, nullable = false, unique = true)
    private UUID studentUuid;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_uuid")
    private UUID userUuid;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "gender", length = 20)
    private String gender; // MALE, FEMALE, OTHER

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "age")
    private Integer age;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Column(name = "skill_level", length = 50)
    private String level; // BEGINNER, INTERMEDIATE, ADVANCED, ELITE, PRO

    @Column(name = "batch_uuid")
    private UUID batchUuid;

    @Column(name = "batch_name", length = 100)
    private String batchName;

    @Column(name = "batch_timing", length = 100)
    private String batchTiming;

    @Column(name = "sport_type", length = 50)
    private String sportType; // Badminton, Tennis, etc.

    @Column(name = "parent_name", length = 150)
    private String parentName;

    @Column(name = "parent_phone", length = 30)
    private String parentPhone;

    @Column(name = "parent_email", length = 150)
    private String parentEmail;

    @Column(name = "emergency_contact", length = 30)
    private String emergencyContact;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "photo", length = 255)
    private String photo;

    @Column(name = "medical_notes", length = 500)
    private String medicalNotes;

    @Column(name = "enrollment_date")
    private LocalDate enrollmentDate;

    @Column(name = "monthly_fee", precision = 10, scale = 2)
    private BigDecimal monthlyFee;

    @Column(name = "fee_frequency", length = 30)
    private String feeFrequency; // MONTHLY, QUARTERLY, ANNUALLY

    @Column(name = "fee_status", length = 30)
    private String feeStatus; // PAID, PENDING, OVERDUE

    @Column(name = "status", nullable = false, length = 30)
    private String status; // ACTIVE, INACTIVE, PAUSED, GRADUATED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.studentUuid == null) {
            this.studentUuid = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
        if (this.feeStatus == null) {
            this.feeStatus = "PENDING";
        }
        if (this.enrollmentDate == null) {
            this.enrollmentDate = LocalDate.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public UUID getStudentUuid() {
        return studentUuid;
    }

    public void setStudentUuid(UUID studentUuid) {
        this.studentUuid = studentUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public UUID getBatchUuid() {
        return batchUuid;
    }

    public void setBatchUuid(UUID batchUuid) {
        this.batchUuid = batchUuid;
    }

    public String getBatchName() {
        return batchName;
    }

    public void setBatchName(String batchName) {
        this.batchName = batchName;
    }

    public String getBatchTiming() {
        return batchTiming;
    }

    public void setBatchTiming(String batchTiming) {
        this.batchTiming = batchTiming;
    }

    public String getSportType() {
        return sportType;
    }

    public void setSportType(String sportType) {
        this.sportType = sportType;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public String getParentPhone() {
        return parentPhone;
    }

    public void setParentPhone(String parentPhone) {
        this.parentPhone = parentPhone;
    }

    public String getParentEmail() {
        return parentEmail;
    }

    public void setParentEmail(String parentEmail) {
        this.parentEmail = parentEmail;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getMedicalNotes() {
        return medicalNotes;
    }

    public void setMedicalNotes(String medicalNotes) {
        this.medicalNotes = medicalNotes;
    }

    public LocalDate getEnrollmentDate() {
        return enrollmentDate;
    }

    public void setEnrollmentDate(LocalDate enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }

    public BigDecimal getMonthlyFee() {
        return monthlyFee;
    }

    public void setMonthlyFee(BigDecimal monthlyFee) {
        this.monthlyFee = monthlyFee;
    }

    public String getFeeFrequency() {
        return feeFrequency;
    }

    public void setFeeFrequency(String feeFrequency) {
        this.feeFrequency = feeFrequency;
    }

    public String getFeeStatus() {
        return feeStatus;
    }

    public void setFeeStatus(String feeStatus) {
        this.feeStatus = feeStatus;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AcademyStudent that = (AcademyStudent) o;
        return Objects.equals(studentUuid, that.studentUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(studentUuid);
    }
}
