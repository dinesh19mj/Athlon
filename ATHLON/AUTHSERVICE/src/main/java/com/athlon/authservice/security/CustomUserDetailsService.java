package com.athlon.authservice.security;

import com.athlon.authservice.auth.entity.Credentials;
import com.athlon.authservice.auth.repository.CredentialsRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final CredentialsRepository credentialsRepository;

    public CustomUserDetailsService(CredentialsRepository credentialsRepository) {
        this.credentialsRepository = credentialsRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Credentials credentials = credentialsRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new CurrentUser(
                credentials.getCredentialId(),
                credentials.getCredentialUuid(),
                credentials.getEmail(),
                credentials.getPasswordHash(),
                credentials.isAccountLocked(),
                credentials.isEmailVerified()
        );
    }
}
