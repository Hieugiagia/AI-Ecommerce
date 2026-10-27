package com.ecommerce.backend.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @NotBlank(message = "Email not be left blank !")
    @Email(message = "Email not valid !")
    private String email;

    @NotBlank(message = "Password not be left blank !")
    private String password;
}
