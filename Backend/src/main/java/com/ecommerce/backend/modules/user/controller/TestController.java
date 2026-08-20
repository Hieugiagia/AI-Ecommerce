package com.ecommerce.backend.modules.user.controller;

import com.ecommerce.backend.common.api.ApiResponse;
import com.ecommerce.backend.common.constant.ErrorCode;
import com.ecommerce.backend.common.exception.AppException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/test")
public class TestController {
    @GetMapping("/hello")
    public ApiResponse<Map<String, String>> sayHello(){
        return ApiResponse.<Map<String, String>> builder()
                .result(Map.of("platform", "AI E-Commerce", "version", "1.0.0"))
                .message("API is running perfectly!")
                .build();
    }

    @GetMapping("/error")
    public ApiResponse<String> displayError(@RequestParam(defaultValue = "false") boolean crash){
        if (crash) {
            throw new AppException(ErrorCode.TEST_ERROR);
        }
        return ApiResponse.<String>builder()
                .result("Pass ?crash=true in URL to test custom exception")
                .build();
    }
}
