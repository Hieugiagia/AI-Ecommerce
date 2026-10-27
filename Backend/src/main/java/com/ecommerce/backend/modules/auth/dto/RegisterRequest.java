package com.ecommerce.backend.modules.auth.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank(message = "Full name not be left blank !")
    private String fullName;

    @NotBlank(message = "Email not be left blank !")
    @Email(message = "Email not valid !")
    private String email;

    private String phone;

    @NotBlank(message = "Password not be left blank !")
    @Size(min = 6,message = "The password must be at least 6 characters long !")
    private String password;

}
