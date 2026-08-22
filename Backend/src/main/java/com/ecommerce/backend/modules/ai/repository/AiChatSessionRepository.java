package com.ecommerce.backend.modules.ai.repository;

import com.ecommerce.backend.modules.ai.entity.AiChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiChatSessionRepository extends JpaRepository<AiChatSession, UUID> {
    //Lấy danh sách các phiên chat của 1 User sắp xếp theo thời gian tạo mới nhất
    List<AiChatSession> findByUserIdOrderByCreatedAtDesc(Long userId);
}
