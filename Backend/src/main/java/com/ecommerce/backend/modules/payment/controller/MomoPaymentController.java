package com.ecommerce.backend.modules.payment.controller;

import com.ecommerce.backend.modules.payment.service.MomoPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class MomoPaymentController {

    private final MomoPaymentService momo;

    @GetMapping("/methods")
    public Map<String, Object> methods() {
        return Map.of(
                "methods",
                List.of(
                        Map.of(
                                "code", "COD",
                                "enabled", true
                        ),
                        Map.of(
                                "code", "MOMO",
                                "enabled", momo.isReady(),
                                "environment", "sandbox"
                        )
                )
        );
    }

    @GetMapping("/momo/{orderCode}")
    public Map<String, Object> status(
            @AuthenticationPrincipal String email,
            @PathVariable String orderCode
    ) {
        return momo.status(email, orderCode);
    }

    @PostMapping("/momo/{orderCode}")
    public Map<String, Object> start(
            @AuthenticationPrincipal String email,
            @PathVariable String orderCode
    ) {
        return momo.start(email, orderCode);
    }

    @PostMapping("/momo/{orderCode}/refresh")
    public Map<String, Object> refresh(
            @AuthenticationPrincipal String email,
            @PathVariable String orderCode
    ) {
        return momo.refresh(email, orderCode);
    }

    @PostMapping("/momo/{orderCode}/cancel")
    public Map<String, Object> cancel(
            @AuthenticationPrincipal String email,
            @PathVariable String orderCode
    ) {
        return momo.cancel(email, orderCode);
    }

    @PostMapping("/momo/ipn")
    public ResponseEntity<Void> ipn(@RequestBody Map<String, Object> body) {
        momo.ipn(body);

        // Chỉ xác nhận nhận IPN sau khi xử lý DB thành công.
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleStatus(
            ResponseStatusException exception
    ) {
        return ResponseEntity
                .status(exception.getStatusCode())
                .body(Map.of(
                        "message",
                        exception.getReason() == null
                                ? "Không xử lý được thanh toán."
                                : exception.getReason()
                ));
    }
}