package com.athlon.authservice.legacy.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "role_mapping")
public class RoleMapping {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rolemapid")
    private Long roleMapId;

	@Column(name = "accountid")
    private Long accountId;

    @Column(name = "accountuuid")
    private UUID accountUuid;

    @Column(name = "roleid")
    private Long roleId;

    @Column(name = "rolename")
    private String roleName;

    @Column(name = "status")
    private String status;

	public Long getRoleMapId() {
		return roleMapId;
	}

	public void setRoleMapId(Long roleMapId) {
		this.roleMapId = roleMapId;
	}

	public Long getAccountId() {
		return accountId;
	}

	public void setAccountId(Long accountId) {
		this.accountId = accountId;
	}

	public UUID getAccountUuid() {
		return accountUuid;
	}

	public void setAccountUuid(UUID accountUuid) {
		this.accountUuid = accountUuid;
	}

	public Long getRoleId() {
		return roleId;
	}

	public void setRoleId(Long roleId) {
		this.roleId = roleId;
	}

	public String getRoleName() {
		return roleName;
	}

	public void setRoleName(String roleName) {
		this.roleName = roleName;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
    
}
