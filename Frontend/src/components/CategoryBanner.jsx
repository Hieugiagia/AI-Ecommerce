import { catalogCategoryImages } from '../data/catalogCategoryImages';
import { categoryIcon } from '../data/categoryUi';
import { Smartphone, Laptop, Headphones, Watch, Keyboard, House, LayoutGrid } from 'lucide-react';

const extraPresentations = Object.fromEntries([
  {
    "slug": "may-tinh-bang",
    "eyebrow": "Máy tính bảng",
    "title": [
      "Gọn nhẹ để mang theo.",
      "Rộng mở để làm nhiều hơn."
    ],
    "description": "Khám phá tablet cho học tập, công việc và giải trí ở bất kỳ đâu.",
    "feature": "Thêm lựa chọn cho mỗi ngày",
    "detail": "Học tập · Sáng tạo · Giải trí",
    "prices": [
      [
        "under5",
        "Dưới 5 triệu"
      ],
      [
        "5to10",
        "5–10 triệu"
      ],
      [
        "10to15",
        "10–15 triệu"
      ]
    ]
  },
  {
    "slug": "camera",
    "eyebrow": "Camera & thiết bị ghi hình",
    "title": [
      "Lưu lại hành trình.",
      "Giữ từng khoảnh khắc."
    ],
    "description": "Tìm camera và thiết bị ghi hình phù hợp với những điều bạn muốn lưu giữ.",
    "feature": "Ghi lại theo góc nhìn của bạn",
    "detail": "Hành trình · Ghi hình · Quan sát",
    "prices": [
      [
        "under5",
        "Dưới 5 triệu"
      ],
      [
        "5to10",
        "5–10 triệu"
      ],
      [
        "10to15",
        "10–15 triệu"
      ]
    ]
  },
  {
    "slug": "micro-thu-am",
    "eyebrow": "Micro thu âm",
    "title": [
      "Thu giọng nói rõ hơn.",
      "Kể câu chuyện của bạn."
    ],
    "description": "Lựa chọn micro cho cuộc trò chuyện, buổi ghi âm và những nội dung mới.",
    "feature": "Sẵn sàng cho nội dung tiếp theo",
    "detail": "Ghi âm · Sáng tạo · Kết nối",
    "prices": [
      [
        "under5",
        "Dưới 5 triệu"
      ],
      [
        "5to10",
        "5–10 triệu"
      ],
      [
        "10to15",
        "10–15 triệu"
      ]
    ]
  },
  {
    "slug": "pc",
    "eyebrow": "PC & máy tính để bàn",
    "title": [
      "Góc máy cho công việc.",
      "Sức mạnh cho đam mê."
    ],
    "description": "Khám phá các bộ máy tính cho học tập, làm việc và giải trí tại nhà.",
    "feature": "Bắt đầu từ một bộ máy phù hợp",
    "detail": "Làm việc · Đồ họa · Chơi game",
    "prices": [
      [
        "10to15",
        "10–15 triệu"
      ],
      [
        "20to25",
        "20–25 triệu"
      ],
      [
        "above30",
        "Trên 30 triệu"
      ]
    ]
  },
  {
    "slug": "man-hinh",
    "eyebrow": "Màn hình máy tính",
    "title": [
      "Thêm không gian nhìn.",
      "Thêm cảm hứng làm việc."
    ],
    "description": "Chọn màn hình cho góc làm việc, sở thích sáng tạo và những giờ giải trí.",
    "feature": "Một góc nhìn thoải mái hơn",
    "detail": "Văn phòng · Sáng tạo · Giải trí",
    "prices": [
      [
        "under5",
        "Dưới 5 triệu"
      ],
      [
        "5to10",
        "5–10 triệu"
      ],
      [
        "10to15",
        "10–15 triệu"
      ]
    ]
  },
  {
    "slug": "may-in",
    "eyebrow": "Máy in",
    "title": [
      "In điều bạn cần.",
      "Chủ động trong công việc."
    ],
    "description": "Thiết bị in ấn cho nhu cầu học tập, gia đình và văn phòng.",
    "feature": "Sắp xếp công việc gọn gàng hơn",
    "detail": "Tài liệu · Học tập · Văn phòng",
    "prices": [
      [
        "under5",
        "Dưới 5 triệu"
      ],
      [
        "5to10",
        "5–10 triệu"
      ],
      [
        "10to15",
        "10–15 triệu"
      ]
    ]
  },
  {
    "slug": "tivi",
    "eyebrow": "Tivi & màn hình lớn",
    "title": [
      "Bật màn hình lớn.",
      "Cùng nhau tận hưởng."
    ],
    "description": "Khám phá tivi cho những buổi xem phim, thể thao và phút quây quần.",
    "feature": "Thêm niềm vui trong không gian sống",
    "detail": "Phim ảnh · Thể thao · Gia đình",
    "prices": [
      [
        "5to10",
        "5–10 triệu"
      ],
      [
        "10to15",
        "10–15 triệu"
      ],
      [
        "above30",
        "Trên 30 triệu"
      ]
    ]
  },
  {
    "slug": "suc-khoe-lam-dep",
    "eyebrow": "Sức khỏe & làm đẹp",
    "title": [
      "Chăm sóc bản thân.",
      "Từ những điều nhỏ."
    ],
    "description": "Tìm thiết bị chăm sóc cá nhân phù hợp với thói quen mỗi ngày của bạn.",
    "feature": "Dành thêm thời gian cho bản thân",
    "detail": "Chăm sóc · Thư giãn · Mỗi ngày",
    "prices": [
      [
        "under5",
        "Dưới 5 triệu"
      ],
      [
        "5to10",
        "5–10 triệu"
      ],
      [
        "10to15",
        "10–15 triệu"
      ]
    ]
  },
  {
    "slug": "dien-may",
    "eyebrow": "Điện máy",
    "title": [
      "Tiện nghi cho tổ ấm.",
      "Nhẹ nhàng mỗi ngày."
    ],
    "description": "Khám phá các thiết bị điện máy giúp hoàn thiện tiện nghi trong gia đình.",
    "feature": "Chọn thiết bị cho không gian sống",
    "detail": "Gia đình · Tiện nghi · Sinh hoạt",
    "prices": [
      [
        "5to10",
        "5–10 triệu"
      ],
      [
        "10to15",
        "10–15 triệu"
      ],
      [
        "15to20",
        "15–20 triệu"
      ]
    ]
  }
].map(item => [item.slug, { ...item, image: catalogCategoryImages[item.slug], alt: item.eyebrow, icon: categoryIcon(item.slug) }]));

const presentations = {
  ...extraPresentations,
  all: {
    eyebrow: 'Khám phá Zentro Store', title: ['Thiết bị phù hợp.', 'Trải nghiệm khác biệt.'],
    description: 'Từ góc làm việc đến những phút thư giãn, chọn công nghệ theo cách bạn sống.',
    image: 'hero-workspace.jpg', alt: 'Laptop trong không gian làm việc', icon: LayoutGrid,
    feature: 'Một nơi cho những lựa chọn mới', detail: 'Điện thoại · Laptop · Âm thanh',
    prices: [['under5', 'Dưới 5 triệu'], ['5to10', '5–10 triệu'], ['above30', 'Trên 30 triệu']],
  },
  'dien-thoai': {
    eyebrow: 'Điện thoại & tablet', title: ['Gọn trong tay.', 'Mở cả thế giới.'],
    description: 'Ghi lại điều đáng nhớ, kết nối người quan trọng. Tìm chiếc điện thoại hợp với bạn mỗi ngày.',
    image: 'category-phone.jpg', alt: 'Điện thoại với thiết kế camera cao cấp', icon: Smartphone,
    feature: 'Từng khoảnh khắc, thật rõ nét', detail: 'Kết nối · Chụp ảnh · Giải trí',
    prices: [['under5', 'Dưới 5 triệu'], ['5to10', '5–10 triệu'], ['10to15', '10–15 triệu']],
  },
  laptop: {
    eyebrow: 'Laptop & máy tính', title: ['Tập trung làm việc.', 'Tự do sáng tạo.'],
    description: 'Một chiếc máy tốt cho những ý tưởng lớn. Khám phá laptop cho học tập, công việc và dự án tiếp theo.',
    image: 'hero-workspace.jpg', alt: 'Laptop trên bàn làm việc tối giản', icon: Laptop,
    feature: 'Góc làm việc, theo cách của bạn', detail: 'Học tập · Công việc · Sáng tạo',
    prices: [['10to15', '10–15 triệu'], ['15to20', '15–20 triệu'], ['20to25', '20–25 triệu']],
  },
  'am-thanh': {
    eyebrow: 'Tai nghe & âm thanh', title: ['Bật thế giới riêng.', 'Nghe trọn từng phút.'],
    description: 'Một bản nhạc hay, cuộc gọi rõ ràng hay phút tập trung. Chọn âm thanh đồng hành cùng nhịp sống của bạn.',
    image: 'category-audio.jpg', alt: 'Tai nghe chụp tai với thiết kế tối giản', icon: Headphones,
    feature: 'Dành chỗ cho âm thanh bạn thích', detail: 'Âm nhạc · Làm việc · Di chuyển',
    prices: [['under5', 'Dưới 5 triệu'], ['5to10', '5–10 triệu'], ['10to15', '10–15 triệu']],
  },
  'dong-ho': {
    eyebrow: 'Đồng hồ thông minh', title: ['Theo kịp nhịp sống.', 'Trọn từng khoảnh khắc.'],
    description: 'Gọn nhẹ trên cổ tay, thuận tiện trong ngày. Khám phá thiết bị phù hợp với phong cách và thói quen của bạn.',
    image: 'category-watch.jpg', alt: 'Đồng hồ với mặt số và dây đeo tối giản', icon: Watch,
    feature: 'Một điểm nhấn trên cổ tay', detail: 'Phong cách · Vận động · Kết nối',
    prices: [['under5', 'Dưới 5 triệu'], ['5to10', '5–10 triệu'], ['10to15', '10–15 triệu']],
  },
  'phu-kien': {
    eyebrow: 'Phụ kiện & góc máy', title: ['Chi tiết nhỏ.', 'Khác biệt mỗi ngày.'],
    description: 'Bàn phím vừa tay, màn hình vừa mắt, phụ kiện vừa nhu cầu. Hoàn thiện góc công nghệ của riêng bạn.',
    image: 'category-accessories.jpg', alt: 'Bàn phím cơ trong góc làm việc', icon: Keyboard,
    feature: 'Hoàn thiện một góc của riêng mình', detail: 'Gõ phím · Kết nối · Làm việc',
    prices: [['under5', 'Dưới 5 triệu'], ['5to10', '5–10 triệu'], ['10to15', '10–15 triệu']],
  },
  'gia-dung': {
    eyebrow: 'Gia dụng & smart home', title: ['Nhà thêm tiện nghi.', 'Ngày thêm thảnh thơi.'],
    description: 'Những thiết bị nhỏ giúp cuộc sống nhẹ nhàng hơn. Tìm thêm tiện ích cho không gian bạn yêu thích.',
    image: 'auth-interior.jpg', alt: 'Không gian nội thất sáng và thoáng', icon: House,
    feature: 'Chăm chút cho không gian sống', detail: 'Tiện nghi · Không gian · Cuộc sống',
    prices: [['under5', 'Dưới 5 triệu'], ['5to10', '5–10 triệu'], ['10to15', '10–15 triệu']],
  },
};

export default function CategoryBanner({ selectedCategory, categories, priceRange, onChoosePrice }) {
  const category = categories.find(item => item.slug === selectedCategory || String(item.id) === selectedCategory);
  const slug = category?.slug || selectedCategory;
  const known = presentations[slug];
  const presentation = known || {
    ...presentations.all,
    eyebrow: category?.name || 'Danh mục sản phẩm',
    title: [category?.name || 'Khám phá sản phẩm', 'Chọn theo nhu cầu của bạn.'],
  };
  const theme = known ? slug : 'all';
  const Icon = presentation.icon;
  return <section className={'category-showcase category-showcase--' + theme} aria-label={category?.name || 'Khám phá sản phẩm'}>
    <div className="category-showcase-copy">
      <p className="category-showcase-eyebrow"><Icon size={19} />{presentation.eyebrow}</p>
      <h1>{presentation.title.map((line, index) => <span key={line} className={index ? 'category-title-accent' : ''}>{line}</span>)}</h1>
      <p className="category-showcase-description">{presentation.description}</p>
      <div className="category-price-shortcuts" aria-label="Lọc nhanh theo giá"><span>Chọn khoảng giá</span><div>{presentation.prices.map(([value, label]) => <button key={value} aria-pressed={priceRange === value} className={priceRange === value ? 'is-active' : ''} onClick={() => onChoosePrice(priceRange === value ? 'all' : value)}>{label}</button>)}</div></div>
    </div>
    <div className={"category-showcase-visual" + (presentation.image.startsWith("/images/catalog/") ? " is-catalog-photo" : "")}>
      <div className="category-photo"><img src={presentation.image.startsWith('/') ? presentation.image : '/images/storefront/' + presentation.image} alt={presentation.alt} fetchPriority="high" /></div>
      <div className="category-photo-caption"><Icon size={22} /><div><strong>{presentation.feature}</strong><span>{presentation.detail}</span></div></div>
    </div>
  </section>;
}
