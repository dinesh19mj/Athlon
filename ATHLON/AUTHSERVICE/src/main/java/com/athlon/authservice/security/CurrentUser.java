package com.athlon.authservice.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

public class CurrentUser implements UserDetails {

    private Long id;
    private UUID uuid;
    private String email;
    private String password;
    private boolean isAccountLocked;
    private boolean isEmailVerified;

    public CurrentUser(Long id, UUID uuid, String email, String password, boolean isAccountLocked, boolean isEmailVerified) {
        this.id = id;
        this.uuid = uuid;
        this.email = email;
        this.password = password;
        this.isAccountLocked = isAccountLocked;
        this.isEmailVerified = isEmailVerified;
    }

    public Long getId() {
        return id;
    }
    
    public UUID getUuid() {
        return uuid;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isAccountLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isEmailVerified;
    }
}
