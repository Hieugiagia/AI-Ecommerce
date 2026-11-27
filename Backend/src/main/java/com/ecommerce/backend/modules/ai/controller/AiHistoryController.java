package com.ecommerce.backend.modules.ai.controller;

import com.ecommerce.backend.modules.ai.entity.AiChatMessage;
import com.ecommerce.backend.modules.ai.entity.AiChatSession;
import com.ecommerce.backend.modules.ai.repository.AiChatMessageRepository;
import com.ecommerce.backend.modules.ai.repository.AiChatSessionRepository;
import com.ecommerce.backend.modules.product.dto.ProductResponse;
import com.ecommerce.backend.modules.product.entity.ProductStatus;
import com.ecommerce.backend.modules.product.repository.ProductRepository;
import com.ecommerce.backend.modules.user.entity.User;
import com.ecommerce.backend.modules.user.entity.UserStatus;
import com.ecommerce.backend.modules.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ai/sessions")
@RequiredArgsConstructor
@Transactional
public class AiHistoryController {

    private final AiChatSessionRepository sessions;
    private final AiChatMessageRepository messages;
    private final UserRepository users;
    private final ProductRepository products;
    private final AiChatController gemini;

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping
    public List<SessionRow> list(@AuthenticationPrincipal String email) {
        User user = currentUser(email, false);

        return sessions.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .sorted(Comparator.comparing(
                        (AiChatSession session) ->
                                session.getUpdatedAt() != null
                                        ? session.getUpdatedAt()
                                        : session.getCreatedAt()
                ).reversed())
                .map(this::summary)
                .toList();
    }

    @PostMapping
    public SessionRow create(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody CreateRequest request
    ) {
        // Khóa ngắn theo tài khoản để tránh tạo trùng phiên.
        User user = currentUser(email, true);

        Optional<AiChatSession> existing =
                sessions.findByUserIdOrderByCreatedAtDesc(user.getId())
                        .stream()
                        .filter(session ->
                                request.clientKey().equals(
                                        session.getClientKey()
                                ))
                        .findFirst();

        if (existing.isPresent()) {
            return summary(existing.get());
        }

        AiChatSession session = AiChatSession.builder()
                .user(user)
                .clientKey(request.clientKey())
                .title(request.title().strip())
                .build();

        return summary(sessions.saveAndFlush(session));
    }

    @GetMapping("/{id}")
    public Conversation get(
            @AuthenticationPrincipal String email,
            @PathVariable UUID id
    ) {
        AiChatSession session = owned(
                currentUser(email, false), id
        );
        return view(session, rows(id));
    }

    @PostMapping("/{id}/turns")
    public Conversation send(
            @AuthenticationPrincipal String email,
            @PathVariable UUID id,
            @Valid @RequestBody TurnRequest request
    ) {
        AiChatSession session = owned(
                currentUser(email, false), id
        );

        // Chỉ khóa phiên chat này, xử lý các lượt gửi tuần tự.
        entityManager.lock(
                session, LockModeType.PESSIMISTIC_WRITE
        );

        List<AiChatMessage> previous = rows(id);
        String question = request.message().strip();

        List<AiChatMessage> existing = previous.stream()
                .filter(message ->
                        request.requestId().equals(
                                message.getClientRequestId()
                        ))
                .toList();

        if (!existing.isEmpty()) {
            boolean sameQuestion = existing.stream().anyMatch(
                    message -> "user".equals(message.getRole())
                            && question.equals(message.getContent())
            );
            boolean answered = existing.stream()
                    .anyMatch(this::isAssistant);

            if (!sameQuestion || !answered) {
                throw fail(HttpStatus.CONFLICT,
                        "Lần gửi này chưa nhất quán. Hãy tải lại lịch sử.");
            }

            // Đã xử lý: trả kết quả cũ, không gọi Gemini lần nữa.
            return view(session, previous);
        }

        AiChatController.ChatResponse answer = gemini.chat(
                new AiChatController.ChatRequest(
                        question, context(previous)
                )
        );

        append(session, request.requestId(),
                "user", question, null);

        String productIds = answer.recommendedProducts().stream()
                .map(product -> product.id().toString())
                .collect(Collectors.joining(","));

        append(session, request.requestId(),
                "assistant", answer.reply(), productIds);

        session.setUpdatedAt(LocalDateTime.now());
        sessions.save(session);
        messages.flush();

        return view(session, rows(id));
    }

    private User currentUser(String email, boolean lock) {
        if (email == null || email.isBlank()) {
            throw fail(HttpStatus.UNAUTHORIZED,
                    "Vui lòng đăng nhập lại.");
        }

        User user = (lock
                ? users.findByEmailForCart(email)
                : users.findByEmail(email))
                .orElseThrow(() -> fail(
                        HttpStatus.UNAUTHORIZED,
                        "Không tìm thấy tài khoản."
                ));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw fail(HttpStatus.FORBIDDEN,
                    "Tài khoản không hoạt động.");
        }

        return user;
    }

    private AiChatSession owned(User user, UUID id) {
        return sessions.findById(id)
                .filter(session ->
                        session.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> fail(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy cuộc trò chuyện."
                ));
    }

    private List<AiChatMessage> rows(UUID id) {
        return messages.findBySessionIdOrderByCreatedAtAsc(id)
                .stream()
                .sorted(Comparator.comparing(AiChatMessage::getId))
                .toList();
    }

    private boolean isAssistant(AiChatMessage message) {
        return "assistant".equals(message.getRole())
                || "model".equals(message.getRole());
    }

    private List<AiChatController.Turn> context(
            List<AiChatMessage> rows
    ) {
        List<AiChatController.Turn> history = new ArrayList<>();

        for (int i = 0; i < rows.size() - 1; i++) {
            AiChatMessage user = rows.get(i);
            AiChatMessage assistant = rows.get(i + 1);

            if ("user".equals(user.getRole())
                    && isAssistant(assistant)) {
                history.add(new AiChatController.Turn(
                        "user",
                        List.of(new AiChatController.Part(
                                user.getContent()
                        ))
                ));
                history.add(new AiChatController.Turn(
                        "model",
                        List.of(new AiChatController.Part(
                                assistant.getContent()
                        ))
                ));
                i++;
            }
        }

        return history.subList(
                Math.max(0, history.size() - 12),
                history.size()
        );
    }

    private void append(
            AiChatSession session,
            UUID requestId,
            String role,
            String text,
            String productIds
    ) {
        messages.save(AiChatMessage.builder()
                .session(session)
                .clientRequestId(requestId)
                .role(role)
                .content(text)
                .recommendedProductIds(productIds)
                .build());
    }

    private List<Long> ids(String value) {
        Set<Long> result = new LinkedHashSet<>();

        if (value != null) {
            for (String part : value.split(",")) {
                try {
                    long id = Long.parseLong(part.strip());
                    if (id > 0 && result.size() < 4) {
                        result.add(id);
                    }
                } catch (NumberFormatException ignored) {
                    // Vẫn cho xem lời tư vấn nếu metadata cũ bị lỗi.
                }
            }
        }

        return new ArrayList<>(result);
    }

    private Conversation view(
            AiChatSession session,
            List<AiChatMessage> rows
    ) {
        Set<Long> requestedIds = rows.stream()
                .flatMap(message ->
                        ids(message.getRecommendedProductIds()).stream())
                .collect(Collectors.toSet());

        Map<Long, ProductResponse> current = products
                .findAllById(requestedIds).stream()
                .filter(product ->
                        product.getStatus() == ProductStatus.PUBLISHED
                                && product.getStock() >= 0)
                .map(ProductResponse::from)
                .collect(Collectors.toMap(
                        ProductResponse::id,
                        product -> product
                ));

        List<SavedMessage> saved = rows.stream()
                .filter(message ->
                        "user".equals(message.getRole())
                                || isAssistant(message))
                .map(message -> new SavedMessage(
                        message.getId(),
                        message.getClientRequestId(),
                        isAssistant(message)
                                ? "assistant" : "user",
                        message.getContent(),
                        message.getCreatedAt(),
                        ids(message.getRecommendedProductIds()).stream()
                                .map(current::get)
                                .filter(Objects::nonNull)
                                .toList()
                ))
                .toList();

        return new Conversation(
                session.getId(), session.getTitle(), saved
        );
    }

    private SessionRow summary(AiChatSession session) {
        return new SessionRow(
                session.getId(),
                session.getTitle(),
                session.getCreatedAt(),
                session.getUpdatedAt()
        );
    }

    private ResponseStatusException fail(
            HttpStatus status, String message
    ) {
        return new ResponseStatusException(status, message);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handle(
            ResponseStatusException exception
    ) {
        return ResponseEntity.status(exception.getStatusCode())
                .body(Map.of(
                        "message",
                        Objects.requireNonNullElse(
                                exception.getReason(),
                                "Chưa xử lý được lịch sử."
                        )
                ));
    }

    public record CreateRequest(
            @NotNull UUID clientKey,
            @NotBlank @Size(max = 100) String title
    ) {}

    public record TurnRequest(
            @NotNull UUID requestId,
            @NotBlank @Size(max = 2000) String message
    ) {}

    public record SessionRow(
            UUID id,
            String title,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    public record SavedMessage(
            Long id,
            UUID clientRequestId,
            String role,
            String text,
            LocalDateTime createdAt,
            List<ProductResponse> recommendedProducts
    ) {}

    public record Conversation(
            UUID id,
            String title,
            List<SavedMessage> messages
    ) {}
}