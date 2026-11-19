package com.ecommerce.backend.modules.user.controller;

import com.ecommerce.backend.modules.user.entity.User;
import com.ecommerce.backend.modules.user.entity.UserAddress;
import com.ecommerce.backend.modules.user.entity.UserStatus;
import com.ecommerce.backend.modules.user.repository.UserAddressRepository;
import com.ecommerce.backend.modules.user.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
@Transactional
public class UserAddressController {
    private final UserRepository userRepository;
    private final UserAddressRepository addressRepository;

    @GetMapping
    public List<AddressResponse> list(@AuthenticationPrincipal String email) {
        User user = currentUser(email);
        return ownedAddresses(user).stream()
                .map(AddressResponse::from)
                .toList();
    }

    @PostMapping
    public AddressResponse create(@AuthenticationPrincipal String email, @Valid @RequestBody AddressRequest request) {
        User user = currentUser(email);
        List<UserAddress> rows = ownedAddresses(user);

        UserAddress address = new UserAddress();
        address.setUser(user);
        apply(address, request);

        rows.add(address);
        selectDefault(rows, request.isDefault() ? address : null);

        return AddressResponse.from(addressRepository.saveAndFlush(address));
    }

    @PutMapping("/{id}")
    public AddressResponse update(@AuthenticationPrincipal String email, @PathVariable Long id, @Valid @RequestBody AddressRequest request) {
        User user = currentUser(email);
        List<UserAddress> rows = ownedAddresses(user);
        UserAddress address = findOwned(rows, id);

        apply(address, request);
        selectDefault(rows, request.isDefault() ? address : null);

        return AddressResponse.from(addressRepository.saveAndFlush(address));
    }

    @PatchMapping("/{id}/default")
    public AddressResponse makeDefault(@AuthenticationPrincipal String email, @PathVariable Long id) {
        User user = currentUser(email);
        List<UserAddress> rows = ownedAddresses(user);
        UserAddress address = findOwned(rows, id);

        selectDefault(rows, address);
        addressRepository.flush();

        return AddressResponse.from(address);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal String email, @PathVariable Long id) {
        User user = currentUser(email);
        List<UserAddress> rows = ownedAddresses(user);
        UserAddress address = findOwned(rows, id);

        rows.remove(address);
        addressRepository.delete(address);
        selectDefault(rows, null);

        return ResponseEntity.noContent().build();
    }

    private User currentUser(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập lại");
        }

        User user = userRepository.findByEmailForCart(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy tài khoản"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản không hoạt động");
        }

        return user;
    }

    private List<UserAddress> ownedAddresses(User user) {
        List<UserAddress> rows = new ArrayList<>(addressRepository.findByUserId(user.getId()));
        rows.sort(Comparator.comparing(UserAddress::getId));
        return rows;
    }

    private UserAddress findOwned(List<UserAddress> rows, Long id) {
        return rows.stream()
                .filter(row -> row.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ"));
    }

    private void apply(UserAddress address, AddressRequest request) {
        address.setReceiver_name(request.receiverName().strip());
        address.setReceiver_phone(request.receiverPhone().strip());
        address.setStreet_address(request.streetAddress().strip());
        address.setWard(request.ward().strip());
        address.setDistrict(request.district().strip());
        address.setCity(request.city().strip());
        address.setIsDefault(request.isDefault());
    }

    private void selectDefault(List<UserAddress> rows, UserAddress preferred) {
        if (rows.isEmpty()) {
            return;
        }

        UserAddress chosen = preferred != null
                ? preferred
                : rows.stream()
                .filter(row ->
                        Boolean.TRUE.equals(row.getIsDefault()))
                .findFirst()
                .orElse(rows.get(0));

        for (UserAddress row : rows) {
            row.setIsDefault(row == chosen);
        }
    }

    public record AddressRequest(
            @NotBlank @Size(max = 100)
            String receiverName,

            @NotBlank
            @Pattern(regexp = "\\+?[0-9]{8,15}", message = "Số điện thoại không hợp lệ")
            String receiverPhone,

            @NotBlank @Size(max = 100)
            String streetAddress,

            @NotBlank @Size(max = 100)
            String ward,

            @NotBlank @Size(max = 100)
            String district,

            @NotBlank @Size(max = 100)
            String city,

            boolean isDefault
    ) {
    }

    public record AddressResponse(
            Long id,
            String receiverName,
            String receiverPhone,
            String streetAddress,
            String ward,
            String district,
            String city,
            boolean isDefault
    ) {
        public static AddressResponse from(UserAddress address) {
            return new AddressResponse(
                    address.getId(),
                    address.getReceiver_name(),
                    address.getReceiver_phone(),
                    address.getStreet_address(),
                    address.getWard(),
                    address.getDistrict(),
                    address.getCity(),
                    Boolean.TRUE.equals(address.getIsDefault())
            );
        }
    }
}