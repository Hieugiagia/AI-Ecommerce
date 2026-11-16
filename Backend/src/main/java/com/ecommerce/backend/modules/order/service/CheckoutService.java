package com.ecommerce.backend.modules.order.service;

import com.ecommerce.backend.modules.order.dto.CheckoutRequest;
import com.ecommerce.backend.modules.order.dto.CheckoutResponse;

public interface CheckoutService {

    CheckoutResponse checkout(String email, CheckoutRequest request);
}