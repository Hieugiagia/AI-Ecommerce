package com.ecommerce.backend.modules.ai.service;

import com.ecommerce.backend.modules.product.dto.ProductResponse;
import com.ecommerce.backend.modules.product.entity.ProductStatus;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public final class AiProductFilter {

    private AiProductFilter() {}

    private static final String[][] CATEGORIES = {
            {"dien-thoai", "dien thoai", "smartphone", "iphone"},
            {"laptop", "laptop", "macbook", "may tinh xach tay"},
            {"may-tinh-bang", "may tinh bang", "tablet", "ipad", "galaxy tab"},
            {"dong-ho", "dong ho", "smartwatch", "galaxy watch"},
            {"am-thanh", "tai nghe", "loa", "am thanh", "airpods"},
            {"micro-thu-am", "micro", "microphone", "micro thu am"},
            {"camera", "camera", "may anh"},
            {"pc", "pc", "may tinh de ban", "mini pc"},
            {"man-hinh", "man hinh"},
            {"may-in", "may in"},
            {"tivi", "tivi", "tv"},
            {"dien-may", "dien may", "tu lanh", "may giat", "may lanh", "dieu hoa"},
            {"gia-dung", "gia dung", "robot hut bui", "noi chien", "may hut bui"},
            {"suc-khoe-lam-dep", "suc khoe", "lam dep", "may say toc"},
            {"phu-kien", "phu kien", "cu sac", "pin du phong", "ban phim", "chuot"}
    };

    private static final String[][] BRANDS = {
            {"apple", "apple", "iphone", "ipad", "macbook", "airpods", "imac"},
            {"samsung", "samsung", "sam sung", "galaxy"},
            {"xiaomi", "xiaomi"},
            {"oppo", "oppo"},
            {"vivo", "vivo"},
            {"realme", "realme"},
            {"honor", "honor"},
            {"huawei", "huawei"},
            {"sony", "sony"},
            {"asus", "asus"},
            {"lenovo", "lenovo"},
            {"dell", "dell"},
            {"hp", "hp"},
            {"acer", "acer"},
            {"msi", "msi"}
    };

    public static List<ProductResponse> select(
            List<ProductResponse> catalog,
            List<String> history,
            String message
    ) {
        Preferences preferences = new Preferences();
        List<String> turns = new ArrayList<>(history);
        turns.add(message);

        for (String turn : turns) {
            String text = fold(turn);

            if (text.startsWith("nhu cau moi:")) {
                preferences.clear();
            }

            String category = categoryHint(text, catalog);
            if (category != null) {
                if (preferences.category != null
                        && !preferences.category.equals(category)) {
                    preferences.brands.clear();
                    preferences.excluded.clear();
                    preferences.maximum = null;
                }
                preferences.category = category;
            }

            if (has(text, "tat ca hang")
                    || has(text, "tat ca thuong hieu")
                    || has(text, "khong gioi han hang")) {
                preferences.brands.clear();
                preferences.excluded.clear();
            }

            BrandHint brand = brandHint(text);
            if (brand != null) {
                if (!brand.positive().isEmpty()) {
                    preferences.brands.clear();
                    preferences.brands.addAll(brand.positive());
                    preferences.excluded.removeAll(brand.positive());
                }
                preferences.brands.removeAll(brand.negative());
                preferences.excluded.addAll(brand.negative());
            }

            PriceLimit maximum = maximum(text);
            if (maximum != null) {
                preferences.maximum = maximum;
            }
        }

        // Bản cha không được thay thế giá của SKU màu đang quản lý.
        Set<String> configuredParents = catalog.stream()
                .filter(p -> p.slug().contains("-mau-"))
                .map(p -> p.slug().split("-mau-", 2)[0])
                .collect(Collectors.toSet());

        Set<String> words = Arrays.stream(key(message).split(" "))
                .filter(word -> word.length() >= 3)
                .collect(Collectors.toSet());

        List<ProductResponse> ranked = catalog.stream()
                .filter(p -> p.status() == ProductStatus.PUBLISHED)
                .filter(p -> p.stock() != null && p.stock() > 0)
                .filter(p -> p.price() != null
                        && p.price().compareTo(BigDecimal.ZERO) >= 0)
                .filter(p -> !configuredParents.contains(p.slug()))
                .filter(p -> categoryMatches(p, preferences.category))
                .filter(p -> preferences.brands.isEmpty()
                        || preferences.brands.stream()
                        .anyMatch(brand -> matchesBrand(p, brand)))
                .filter(p -> preferences.excluded.stream()
                        .noneMatch(brand -> matchesBrand(p, brand)))
                .filter(p -> preferences.maximum == null
                        || preferences.maximum.allows(p.price()))
                .sorted(Comparator
                        .<ProductResponse>comparingInt(p -> {
                            String text = key(p.name() + " " + p.categoryName());
                            return (int) words.stream()
                                    .filter(text::contains).count();
                        })
                        .reversed()
                        .thenComparing(ProductResponse::price))
                .toList();

        Map<String, ProductResponse> unique = new LinkedHashMap<>();
        for (ProductResponse product : ranked) {
            unique.putIfAbsent(
                    product.slug().split("-mau-", 2)[0],
                    product
            );
        }

        // Giữ đa dạng danh mục nếu người dùng chưa chọn loại cụ thể.
        Map<String, Deque<ProductResponse>> groups = new LinkedHashMap<>();
        for (ProductResponse product : unique.values()) {
            groups.computeIfAbsent(
                    product.categorySlug(), ignored -> new ArrayDeque<>()
            ).add(product);
        }

        List<ProductResponse> result = new ArrayList<>();
        while (result.size() < 24
                && groups.values().stream().anyMatch(q -> !q.isEmpty())) {
            for (Deque<ProductResponse> group : groups.values()) {
                if (!group.isEmpty() && result.size() < 24) {
                    result.add(group.removeFirst());
                }
            }
        }
        return result;
    }

    private static String categoryHint(
            String text,
            List<ProductResponse> catalog
    ) {
        var guided = Pattern.compile(
                "^nhu cau moi:\\s*toi muon ([^.]+)\\."
        ).matcher(text);

        if (guided.find()) {
            String name = key(guided.group(1).split(" cua ", 2)[0]);
            return catalog.stream()
                    .filter(p -> key(p.categoryName()).equals(name))
                    .map(ProductResponse::categorySlug)
                    .findFirst()
                    .orElse("name:" + name);
        }

        for (String[] row : CATEGORIES) {
            for (int i = 1; i < row.length; i++) {
                if (has(text, row[i])) {
                    return row[0];
                }
            }
        }
        return null;
    }

    private static boolean categoryMatches(
            ProductResponse product,
            String category
    ) {
        if (category == null) return true;
        if (category.startsWith("name:")) {
            return key(product.categoryName())
                    .equals(category.substring(5));
        }
        return category.equals(product.categorySlug());
    }

    private static BrandHint brandHint(String text) {
        var guided = Pattern.compile(
                "^nhu cau moi:\\s*toi muon ([^.]+)\\."
        ).matcher(text);

        if (guided.find()) {
            String[] parts = guided.group(1).split(" cua ", 2);
            return new BrandHint(
                    parts.length == 2
                            ? Set.of(key(parts[1]))
                            : Set.of(),
                    Set.of()
            );
        }

        Set<String> positive = new HashSet<>();
        Set<String> negative = new HashSet<>();
        boolean mentioned = false;

        for (String[] row : BRANDS) {
            boolean found = false;
            boolean rejected = false;

            for (int i = 1; i < row.length; i++) {
                if (!has(text, row[i])) continue;
                found = true;
                String pattern =
                        "(?:khong(?: muon| mua| dung| chon)?"
                                + "|bo qua|tru|ngoai|thay cho)\\s+"
                                + Pattern.quote(row[i]) + "\\b";

                if (Pattern.compile(pattern).matcher(text).find()) {
                    rejected = true;
                }
            }

            if (found) {
                mentioned = true;
                (rejected ? negative : positive).add(row[0]);
            }
        }

        return mentioned ? new BrandHint(positive, negative) : null;
    }

    private static boolean matchesBrand(
            ProductResponse product,
            String brand
    ) {
        for (String[] row : BRANDS) {
            if (row[0].equals(brand)) {
                for (int i = 1; i < row.length; i++) {
                    if (has(product.name(), row[i])) return true;
                }
                return false;
            }
        }
        return has(product.name(), brand);
    }

    private static PriceLimit maximum(String text) {
        if (has(text, "khong gioi han ngan sach")
                || has(text, "khong gioi han gia")) {
            return new PriceLimit(null, false);
        }

        var matcher = Pattern.compile(
                "(duoi|toi da|khong qua|ngan sach(?: toi da)?)"
                        + "\\s*:?\\s*([0-9]+(?:[.,][0-9]+)*)"
                        + "\\s*(trieu|trd|tr|m|nghin|ngan|k|dong|vnd|d)\\b"
        ).matcher(text);

        if (!matcher.find()) return null;

        String number = matcher.group(2);
        if (number.matches("\\d{1,3}(?:[.,]\\d{3})+")) {
            number = number.replaceAll("[.,]", "");
        } else {
            number = number.replace(',', '.');
        }

        try {
            BigDecimal multiplier = switch (matcher.group(3)) {
                case "trieu", "trd", "tr", "m" ->
                        BigDecimal.valueOf(1_000_000);
                case "nghin", "ngan", "k" ->
                        BigDecimal.valueOf(1_000);
                default -> BigDecimal.ONE;
            };

            return new PriceLimit(
                    new BigDecimal(number).multiply(multiplier),
                    "duoi".equals(matcher.group(1))
            );
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private static boolean has(String text, String phrase) {
        String wanted = key(phrase);
        return !wanted.isBlank()
                && (" " + key(text) + " ")
                .contains(" " + wanted + " ");
    }

    private static String fold(String text) {
        return Normalizer.normalize(
                        Objects.toString(text, ""),
                        Normalizer.Form.NFD
                )
                .replaceAll("\\p{M}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'D')
                .toLowerCase(Locale.ROOT)
                .strip();
    }

    private static String key(String text) {
        return fold(text)
                .replaceAll("[^\\p{L}\\p{N}]+", " ")
                .strip();
    }

    private static class Preferences {
        String category;
        final Set<String> brands = new HashSet<>();
        final Set<String> excluded = new HashSet<>();
        PriceLimit maximum;

        void clear() {
            category = null;
            brands.clear();
            excluded.clear();
            maximum = null;
        }
    }

    private record BrandHint(
            Set<String> positive,
            Set<String> negative
    ) {}

    private record PriceLimit(
            BigDecimal amount,
            boolean strict
    ) {
        boolean allows(BigDecimal price) {
            if (amount == null) return true;
            int comparison = price.compareTo(amount);
            return strict ? comparison < 0 : comparison <= 0;
        }
    }
}