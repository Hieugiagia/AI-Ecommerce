package com.ecommerce.backend.modules.user.repository;

import com.ecommerce.backend.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    //SELECT * FROM users WHERE email
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

}
