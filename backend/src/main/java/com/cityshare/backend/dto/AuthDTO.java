package com.cityshare.backend.dto;

import lombok.*;

public class AuthDTO {

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RegisterRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private String phone;
        private String role;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        @Builder.Default
        private String type = "Bearer";
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String role;
        private Double rating;
        private Boolean verified;
    }
}
