package com.ecommerce.backend.modules.payment.service;

import com.ecommerce.backend.modules.order.entity.Order;
import com.ecommerce.backend.modules.order.entity.OrderStatus;
import com.ecommerce.backend.modules.order.repository.OrderRepository;
import com.ecommerce.backend.modules.payment.entity.Payment;
import com.ecommerce.backend.modules.payment.entity.PaymentMethod;
import com.ecommerce.backend.modules.payment.entity.PaymentStatus;
import com.ecommerce.backend.modules.payment.repository.PaymentRepository;
import com.ecommerce.backend.modules.product.entity.ProductStatus;
import com.ecommerce.backend.modules.product.repository.ProductRepository;
import com.ecommerce.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.StringJoiner;
import java.util.UUID;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class MomoPaymentService {

    // Chỉ dùng môi trường sandbox trong giai đoạn này.
    private static final String BASE_URL =
            "https://test-payment.momo.vn";

    private static final Set<Integer> FINAL_FAILURES = Set.of(
            1001, 1002, 1003, 1004, 1005,
            1006, 1007, 1017, 1026
    );

    private final OrderRepository orders;
    private final PaymentRepository payments;
    private final ProductRepository products;
    private final UserRepository users;
    private final PlatformTransactionManager transactionManager;

    private final RestClient client = createClient();

    @Value("${MOMO_ENABLED:false}")
    private boolean enabled;

    @Value("${MOMO_PARTNER_CODE:}")
    private String partnerCode;

    @Value("${MOMO_ACCESS_KEY:}")
    private String accessKey;

    @Value("${MOMO_SECRET_KEY:}")
    private String secretKey;

    @Value("${MOMO_REDIRECT_URL:http://localhost:5173/payments/momo}")
    private String redirectUrl;

    @Value("${MOMO_IPN_URL:}")
    private String ipnUrl;

    // Giới hạn thử nghiệm của ứng dụng.
    // Cần đối chiếu hạn mức merchant khi nhận tài khoản MoMo.
    @Value("${MOMO_MAX_AMOUNT:50000000}")
    private long maxAmount;

    private record Locked(Order order, Payment payment) {
    }

    private record Attempt(
            String orderCode,
            BigDecimal amount,
            String requestId,
            String redirectUrl,
            String ipnUrl,
            String payUrl,
            PaymentStatus status,
            boolean canCancel
    ) {
    }

    private static RestClient createClient() {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(35000);

        return RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    public boolean isReady() {
        return enabled
                && !partnerCode.isBlank()
                && !accessKey.isBlank()
                && !secretKey.isBlank()
                && validUrl(ipnUrl, true)
                && validUrl(redirectUrl, false)
                && maxAmount >= 1000;
    }

    private boolean validUrl(String value, boolean httpsOnly) {
        try {
            URI uri = URI.create(value);

            boolean schemeValid = "https".equals(uri.getScheme())
                    || (!httpsOnly && "http".equals(uri.getScheme()));

            return schemeValid
                    && uri.getHost() != null
                    && uri.getUserInfo() == null
                    && uri.getQuery() == null
                    && uri.getFragment() == null;
        } catch (RuntimeException exception) {
            return false;
        }
    }

    public String redirectUrl() {
        return redirectUrl;
    }

    public String ipnUrl() {
        return ipnUrl;
    }

    public void validateCheckout(BigDecimal amount) {
        if (!isReady()) {
            throw error(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "MoMo Sandbox chưa được cấu hình."
            );
        }

        try {
            long value = amount.longValueExact();

            if (value < 1000 || value > maxAmount) {
                throw error(
                        HttpStatus.BAD_REQUEST,
                        "Số tiền nằm ngoài giới hạn MoMo thử nghiệm. "
                                + "Vui lòng chọn COD."
                );
            }
        } catch (ArithmeticException exception) {
            throw error(
                    HttpStatus.BAD_REQUEST,
                    "MoMo yêu cầu số tiền VND nguyên."
            );
        }
    }

    public Map<String, Object> status(String email, String orderCode) {
        return transaction(() ->
                view(snapshot(owned(email, orderCode)))
        );
    }

    public Map<String, Object> start(String email, String orderCode) {
        Attempt attempt = transaction(() -> {
            Locked locked = owned(email, orderCode);
            Payment payment = locked.payment();

            if (payment.getStatus() != PaymentStatus.PENDING) {
                return snapshot(locked);
            }

            if (locked.order().getStatus() != OrderStatus.PENDING) {
                throw error(
                        HttpStatus.CONFLICT,
                        "Đơn hàng không còn chờ thanh toán."
                );
            }

            validateCheckout(payment.getAmount());

            // Ghi nhận trước khi gọi MoMo.
            // Nếu mất kết nối, không cho hủy như đơn chưa gửi đi.
            if (payment.getMomoStartedAt() == null) {
                payment.setMomoStartedAt(LocalDateTime.now());
                payments.saveAndFlush(payment);
            }

            return snapshot(locked);
        });

        if (attempt.status() != PaymentStatus.PENDING
                || attempt.payUrl() != null) {
            return view(attempt);
        }

        Map<String, Object> body = new LinkedHashMap<>();

        body.put("partnerCode", partnerCode);
        body.put("requestId", attempt.requestId());
        body.put("amount", attempt.amount().longValueExact());
        body.put("orderId", attempt.orderCode());
        body.put("orderInfo", orderInfo(attempt.orderCode()));
        body.put("redirectUrl", attempt.redirectUrl());
        body.put("ipnUrl", attempt.ipnUrl());
        body.put("lang", "vi");
        body.put("extraData", "");
        body.put("requestType", "captureWallet");
        body.put("autoCapture", true);

        body.put("signature", signFields(
                body,
                "amount",
                "extraData",
                "ipnUrl",
                "orderId",
                "orderInfo",
                "partnerCode",
                "redirectUrl",
                "requestId",
                "requestType"
        ));

        // Gọi mạng ở ngoài transaction giữ khóa DB.
        Map<String, Object> result =
                call("/v2/gateway/api/create", body);

        validateIdentity(result, attempt, attempt.requestId());

        if (number(result, "resultCode") != 0) {
            // Không kết luận đã thanh toán hoặc tự hoàn kho
            // chỉ từ việc tạo liên kết thất bại.
            throw error(
                    HttpStatus.BAD_GATEWAY,
                    "MoMo chưa tạo được liên kết thanh toán. "
                            + "Hãy kiểm tra kết quả của cùng đơn hàng."
            );
        }

        String payUrl = field(result, "payUrl");

        if (!validPayUrl(payUrl)) {
            throw error(
                    HttpStatus.BAD_GATEWAY,
                    "MoMo trả về đường dẫn thanh toán không hợp lệ."
            );
        }

        return transaction(() -> {
            Locked locked = owned(email, orderCode);
            Payment payment = locked.payment();

            if (payment.getStatus() == PaymentStatus.PENDING) {
                payment.setMomoPayUrl(payUrl);
                payments.saveAndFlush(payment);
            }

            return view(snapshot(locked));
        });
    }

    public Map<String, Object> refresh(
            String email,
            String orderCode
    ) {
        Attempt attempt = transaction(() ->
                snapshot(owned(email, orderCode))
        );

        if (attempt.status() != PaymentStatus.PENDING
                || attempt.canCancel()) {
            return view(attempt);
        }

        if (partnerCode.isBlank()
                || accessKey.isBlank()
                || secretKey.isBlank()) {
            throw error(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Chưa có thông tin kết nối MoMo."
            );
        }

        String queryRequestId = UUID.randomUUID().toString();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode", partnerCode);
        body.put("requestId", queryRequestId);
        body.put("orderId", attempt.orderCode());
        body.put("lang", "vi");

        body.put("signature", signFields(
                body,
                "orderId",
                "partnerCode",
                "requestId"
        ));

        Map<String, Object> result =
                call("/v2/gateway/api/query", body);

        // Chỉ chấp nhận phản hồi đúng giao dịch và đúng số tiền.
        // "Không tìm thấy" hoặc phản hồi thiếu dữ liệu
        // không đủ để tự hủy và hoàn kho.
        validateIdentity(result, attempt, queryRequestId);

        return applyResult(attempt, result);
    }

    public Map<String, Object> cancel(
            String email,
            String orderCode
    ) {
        return transaction(() -> {
            Locked locked = owned(email, orderCode);
            Payment payment = locked.payment();

            if (payment.getStatus() == PaymentStatus.CANCELLED) {
                return view(snapshot(locked));
            }

            if (payment.getStatus() != PaymentStatus.PENDING
                    || payment.getMomoStartedAt() != null) {
                throw error(
                        HttpStatus.CONFLICT,
                        "Đơn đã gửi sang MoMo. "
                                + "Cần kiểm tra kết quả thanh toán trước."
                );
            }

            cancelAndRestock(
                    locked,
                    PaymentStatus.CANCELLED,
                    "Khách hủy trước khi mở thanh toán MoMo."
            );

            return view(snapshot(locked));
        });
    }

    public void ipn(Map<String, Object> body) {
        if (accessKey.isBlank() || secretKey.isBlank()) {
            throw error(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Chưa cấu hình khóa xác minh MoMo."
            );
        }

        String expected = signFields(
                body,
                "amount",
                "extraData",
                "message",
                "orderId",
                "orderInfo",
                "orderType",
                "partnerCode",
                "payType",
                "requestId",
                "responseTime",
                "resultCode",
                "transId"
        );

        String received = field(body, "signature");

        if (!received.matches("(?i)[0-9a-f]{64}")
                || !MessageDigest.isEqual(
                HexFormat.of().parseHex(expected),
                HexFormat.of().parseHex(received)
        )) {
            throw error(
                    HttpStatus.BAD_REQUEST,
                    "Chữ ký MoMo không hợp lệ."
            );
        }

        String code = field(body, "orderId");

        Attempt attempt = transaction(() ->
                snapshot(byCode(code))
        );

        validateIdentity(body, attempt, attempt.requestId());

        if (!"momo_wallet".equals(field(body, "orderType"))
                || !"".equals(field(body, "extraData"))
                || !orderInfo(code).equals(field(body, "orderInfo"))) {
            throw error(
                    HttpStatus.BAD_REQUEST,
                    "Nội dung giao dịch MoMo không khớp."
            );
        }

        applyResult(attempt, body);
    }

    private Map<String, Object> applyResult(
            Attempt attempt,
            Map<String, Object> result
    ) {
        int resultCode = number(result, "resultCode");

        return transaction(() -> {
            Locked locked = byCode(attempt.orderCode());
            Payment payment = locked.payment();

            if (!attempt.requestId().equals(payment.getMomoRequestId())
                    || attempt.amount().compareTo(
                    locked.order().getTotalAmount()
            ) != 0) {
                throw error(
                        HttpStatus.CONFLICT,
                        "Thông tin thanh toán đã thay đổi."
                );
            }

            // Không hạ trạng thái của giao dịch đã thành công.
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                if (resultCode == 0
                        && !("MOMO-" + field(result, "transId"))
                        .equals(payment.getTransactionCode())) {
                    throw error(
                            HttpStatus.CONFLICT,
                            "Mã giao dịch MoMo không khớp."
                    );
                }

                return view(snapshot(locked));
            }

            if (payment.getStatus() != PaymentStatus.PENDING) {
                if (resultCode == 0) {
                    throw error(
                            HttpStatus.CONFLICT,
                            "Đơn đã kết thúc nhưng nhận thanh toán thành công. "
                                    + "Cần đối soát thủ công."
                    );
                }

                return view(snapshot(locked));
            }

            if (locked.order().getStatus() != OrderStatus.PENDING) {
                throw error(
                        HttpStatus.CONFLICT,
                        "Trạng thái đơn không phù hợp để ghi thanh toán."
                );
            }

            if (resultCode == 0) {
                String transId = field(result, "transId");

                if (!transId.matches("[1-9][0-9]{0,19}")) {
                    throw error(
                            HttpStatus.BAD_REQUEST,
                            "Mã giao dịch MoMo không hợp lệ."
                    );
                }

                payment.setTransactionCode("MOMO-" + transId);
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setPaidAt(LocalDateTime.now());

                payments.saveAndFlush(payment);
            } else if (FINAL_FAILURES.contains(resultCode)) {
                cancelAndRestock(
                        locked,
                        PaymentStatus.FAILED,
                        "MoMo xác nhận giao dịch thất bại: " + resultCode
                );
            }

            // Trạng thái đang xử lý hoặc chưa xác định:
            // giữ nguyên đơn và khoản thanh toán PENDING.
            return view(snapshot(locked));
        });
    }

    private void cancelAndRestock(
            Locked locked,
            PaymentStatus paymentStatus,
            String reason
    ) {
        if (locked.order().getStatus() != OrderStatus.PENDING) {
            throw error(
                    HttpStatus.CONFLICT,
                    "Không thể hủy đơn ở trạng thái hiện tại."
            );
        }

        var items = locked.order().getItems().stream()
                .sorted(Comparator.comparing(
                        item -> item.getProduct().getId()
                ))
                .toList();

        for (var item : items) {
            var product = products.findByIdForCheckout(
                    item.getProduct().getId()
            ).orElseThrow(() ->
                    error(HttpStatus.CONFLICT, "Không tìm thấy sản phẩm.")
            );

            if (item.getQuantity() == null || item.getQuantity() < 1) {
                throw error(
                        HttpStatus.CONFLICT,
                        "Số lượng hoàn kho không hợp lệ."
                );
            }

            int stock = Math.addExact(
                    product.getStock(),
                    item.getQuantity()
            );

            product.setStock(stock);

            if (product.getStatus() == ProductStatus.OUT_OF_STOCK
                    && stock > 0) {
                product.setStatus(ProductStatus.PUBLISHED);
            }
        }

        locked.order().setStatus(OrderStatus.CANCELLED);
        locked.order().setCancelReason(reason);
        locked.order().setCancelledAt(LocalDateTime.now());

        locked.payment().setStatus(paymentStatus);

        orders.saveAndFlush(locked.order());
        payments.saveAndFlush(locked.payment());
    }

    private Locked owned(String email, String orderCode) {
        var user = users.findByEmail(email).orElseThrow(() ->
                error(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập.")
        );

        Order order = orders.findOwnedOrderForUpdate(
                orderCode,
                user.getId()
        ).orElseThrow(() ->
                error(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng.")
        );

        return withPayment(order);
    }

    private Locked byCode(String orderCode) {
        Order order = orders.findByOrderCodeForUpdate(orderCode)
                .orElseThrow(() ->
                        error(
                                HttpStatus.NOT_FOUND,
                                "Không tìm thấy đơn hàng."
                        )
                );

        return withPayment(order);
    }

    private Locked withPayment(Order order) {
        Payment payment = payments.findByOrderIdForUpdate(order.getId())
                .orElseThrow(() ->
                        error(
                                HttpStatus.NOT_FOUND,
                                "Không tìm thấy thanh toán."
                        )
                );

        if (payment.getPaymentMethod() != PaymentMethod.MOMO
                || payment.getMomoRequestId() == null
                || payment.getAmount().compareTo(
                order.getTotalAmount()
        ) != 0) {
            throw error(
                    HttpStatus.CONFLICT,
                    "Đơn không có giao dịch MoMo hợp lệ."
            );
        }

        return new Locked(order, payment);
    }

    private Attempt snapshot(Locked locked) {
        Payment payment = locked.payment();

        return new Attempt(
                locked.order().getOrderCode(),
                payment.getAmount(),
                payment.getMomoRequestId(),
                payment.getMomoRedirectUrl(),
                payment.getMomoIpnUrl(),
                payment.getMomoPayUrl(),
                payment.getStatus(),
                payment.getStatus() == PaymentStatus.PENDING
                        && payment.getMomoStartedAt() == null
                        && locked.order().getStatus() == OrderStatus.PENDING
        );
    }

    private Map<String, Object> view(Attempt attempt) {
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("orderCode", attempt.orderCode());
        result.put("paymentMethod", "MOMO");
        result.put("amount", attempt.amount());
        result.put("status", attempt.status().name());
        result.put("environment", "sandbox");
        result.put("canCancel", attempt.canCancel());
        result.put("payUrl", attempt.payUrl());

        return result;
    }

    private void validateIdentity(
            Map<String, Object> result,
            Attempt attempt,
            String expectedRequestId
    ) {
        if (!partnerCode.equals(field(result, "partnerCode"))
                || !attempt.orderCode().equals(field(result, "orderId"))
                || !expectedRequestId.equals(field(result, "requestId"))) {
            throw error(
                    HttpStatus.BAD_GATEWAY,
                    "Phản hồi MoMo không đúng giao dịch."
            );
        }

        try {
            BigDecimal amount =
                    new BigDecimal(field(result, "amount"));

            if (amount.compareTo(attempt.amount()) != 0) {
                throw error(
                        HttpStatus.BAD_GATEWAY,
                        "Số tiền MoMo trả về không khớp đơn hàng."
                );
            }
        } catch (NumberFormatException exception) {
            throw error(
                    HttpStatus.BAD_GATEWAY,
                    "Phản hồi MoMo thiếu số tiền hợp lệ."
            );
        }
    }

    private Map<String, Object> call(
            String path,
            Map<String, Object> body
    ) {
        try {
            String json = client.post()
                    .uri(BASE_URL + path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            return JsonParserFactory.getJsonParser().parseMap(json);
        } catch (RuntimeException exception) {
            throw error(
                    HttpStatus.BAD_GATEWAY,
                    "Chưa nhận được phản hồi hợp lệ từ MoMo. "
                            + "Không đặt thêm đơn; hãy kiểm tra lại kết quả."
            );
        }
    }

    private String signFields(
            Map<String, Object> body,
            String... keys
    ) {
        StringJoiner raw = new StringJoiner("&");
        raw.add("accessKey=" + accessKey);

        for (String key : keys) {
            raw.add(key + "=" + field(body, key));
        }

        try {
            Mac mac = Mac.getInstance("HmacSHA256");

            mac.init(new SecretKeySpec(
                    secretKey.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            ));

            return HexFormat.of().formatHex(mac.doFinal(
                    raw.toString().getBytes(StandardCharsets.UTF_8)
            ));
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Không khởi tạo được chữ ký MoMo.",
                    exception
            );
        }
    }

    private String field(Map<String, Object> body, String key) {
        Object value = body.get(key);

        if (value == null) {
            throw error(
                    HttpStatus.BAD_REQUEST,
                    "Thiếu trường MoMo: " + key
            );
        }

        // Không trim vì chữ ký phải dùng đúng nội dung nhận được.
        return value.toString();
    }

    private int number(Map<String, Object> body, String key) {
        try {
            return Integer.parseInt(field(body, key));
        } catch (NumberFormatException exception) {
            throw error(
                    HttpStatus.BAD_REQUEST,
                    "Trường MoMo không đúng định dạng: " + key
            );
        }
    }

    private String orderInfo(String orderCode) {
        return "Zentro Store " + orderCode;
    }

    private boolean validPayUrl(String value) {
        try {
            URI uri = URI.create(value);

            return "https".equals(uri.getScheme())
                    && "test-payment.momo.vn".equals(uri.getHost())
                    && uri.getUserInfo() == null
                    && uri.getPort() == -1;
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private <T> T transaction(Supplier<T> action) {
        return new TransactionTemplate(transactionManager)
                .execute(status -> action.get());
    }

    private ResponseStatusException error(
            HttpStatus status,
            String message
    ) {
        return new ResponseStatusException(status, message);
    }
}