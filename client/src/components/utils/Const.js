export const MAIN_CATEGORY = [
  {key:0, value: "All"},
  {key:1, value: "Cosmetic"},
  {key:2, value: "Pharmaceuticals"},
  {key:3, value: "Food/Supplement"},
  {key:4, value: "Daily Necessaries"},
  {key:5, value: "Baby"},
  {key:6, value: "Pet"}
]

export const CouponType = [
  {key:"0", value: "Gross Percentage"},
  {key:"1", value: "Granting points"},
  {key:"2", value: "Discount amount"}
]

export const CouponActive = [
  {key:"0", value: "inactive"},
  {key:"1", value: "active"}
]

export const UseWithSale = [
  {key:0, value: "Coupon only"},
  {key:1, value: "Coupon and Sale"},
  {key:2, value: "Sale only"}
]

export const SaleType = [
  {key:"0", value: "Gross Percentage"},
  {key:"1", value: "Granting points"},
  {key:"2", value: "Discount amount"}
]

export const SaleActive = [
  {key:"0", value: "inactive"},
  {key:"1", value: "active"}
]

// Landing page 노출상품 정의
export const PRODUCT_VISIBLE_TYPE = [
  {key:0, value: "None"}, // 노출안함
  {key:1, value: "Now On Air"}, // 현재 방송중인 상품
  {key:2, value: "Recording"}, // 상품 녹화있음
  {key:3, value: "Recommended"}, // 추천상품
  {key:4, value: "Sale"}, // 세일상품
]

// 이미지 등록 또는 수정시 선택항목 
export const IMAGES_TYPE = [
  {"_id": 0, "name": "Logo"},
  {"_id": 1, "name": "Banner"},
  {"_id": 2, "name": "Pharmaceuticals"},
  {"_id": 3, "name": "Cosmetics"},
  {"_id": 4, "name": "Daily necessaries"},
  {"_id": 5, "name": "Food"},
  {"_id": 6, "name": "baby"},
  {"_id": 7, "name": "pet"}
]
// 이미지 등록 또는 수정시 선택항목
export const IMAGES_VISIBLE_ITEM = [
  {"_id": 0, "name": "Invisible"},
  {"_id": 1, "name": "Visible"}
]
// 이미지 등록 또는 수정시 선택항목
export const IMAGES_LANGUAGE = [
  {"_id": "jp", "name": "Japanese"},
  {"_id": "cn", "name": "Chinese" },
  {"_id": "en", "name": "English" }
]
// AWS 서비스 선택항목
export const AWS_TYPE = [
  {"_id": "S3", "name": "S3"},
  {"_id": "SES", "name": "SES" }
]

// 상품 리스트화면의 검색조건
// export const PRODUCT_LIST_CATEGORY = [
//   { "_id": 1, "name": "Cosmetic" },
//   { "_id": 2, "name": "Pharmaceuticals"  },
//   { "_id": 3, "name": "Food/Supplement" },
//   { "_id": 4, "name": "Daily Necessaries" },
//   { "_id": 5, "name": "Baby" },
//   { "_id": 6, "name": "Pet" },
//   { "_id": 7, "name": "Recommended" },
//   { "_id": 8, "name": "Sale" }
// ]

export const PRODUCT_LIST_CATEGORY = [
  {key:0, value: "All"},
  {key:1, value: "Cosmetic"},
  {key:2, value: "Pharmaceuticals"},
  {key:3, value: "Food/Supplement"},
  {key:4, value: "Daily Necessaries"},
  {key:5, value: "Baby"},
  {key:6, value: "Pet"},
  {key:7, value: "Recommended"},
  {key:8, value: "Sale"}
]

export const COSMETIC_CATEGORY = [
  {key:1, value: "Skin Care"},
  {key:2, value: "Eye Care"},
  {key:3, value: "Hair Care"},
  {key:4, value: "Others"},
  {key:5, value: "Supplement"},
  {key:6, value: "Men's"}
]

export const PHARMACEUTICALS_CATEGORY = [
]

export const FOOD_CATEGORY = [
]

export const DAILY_NECESSARIES_CATEGORY = [
]

export const BABY_CATEGORY = [
]

export const PET_CATEGORY = [
]


// 상품 리스트화면의 검색조건
export const COSMETICS = [
  {
    "_id": 1,
    "name": "Skin Care"
  },
  {
    "_id": 2,
    "name": "Eye Care"
  },
  {
    "_id": 3,
    "name": "Hair Care"
  },
  {
    "_id": 4,
    "name": "Others"
  },
  {
    "_id": 5,
    "name": "Supplement"
  },
  {
    "_id": 6,
    "name": "Men's"
  }
]

export const PRICE = [
  {
    "_id": 0,
    "name": "Any",
    "array": []
  },
  {
    "_id": 1,
    "name": "¥0 to ¥1990",
    "array": [0, 1990]
  },
  {
    "_id": 2,
    "name": "¥2000 to ¥2499",
    "array": [2000, 2499]
  },
  {
    "_id": 3,
    "name": "¥2500 to ¥2799",
    "array": [2500, 2799]
  },
  {
    "_id": 4,
    "name": "¥2800 to ¥2990",
    "array": [2800, 2999]
  },
  {
    "_id": 5,
    "name": "More than ¥3000",
    "array": [3000, 15000000]
  },
]


export const NOT_SET = "未設定";
export const Unidentified = "未確認";
export const DeliveryCompleted = "配送手続き完了";
export const Deposited = "入金済み";
export const ECSystem = "ECSystem";
export const NOTHING = "無し";
export const EXPIRED_JP = "失効";
export const EXPIRED_EN = "Expired";
export const EXPIRED_CN = "已到期";
export const OPEN = "open";
export const PRIVATE = "private";
export const SALE_TAG = "sale";
export const NOTICE_TAG = "notice";

export const ENGLISH = "English";
export const JAPANESE = "日本語";
export const CHINESE = "中文（簡体）";
export const I18N_ENGLISH = "en";
export const I18N_CHINESE = "cn";
export const I18N_JAPANESE = "jp";

// LANDING PAGE SESSION에 저장할때 사용하는 Key
export const VIDEO_JP = "video_jp";
export const VIDEO_CN = "video_cn";
export const VIDEO_EN = "video_en";