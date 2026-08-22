package com.ecommerce.backend.modules.ai.repository;

import com.ecommerce.backend.modules.ai.entity.AiChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, UUID> {
// Lấy toàn bộ tin nhắn theo sessionId sắp xếp theo thứ tự gửi tăng dần để nạp vào Context LLM
    List<AiChatMessage> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);
}
