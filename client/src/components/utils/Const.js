export const MAIN_CATEGORY = [
  {key:0, value: "All"},
  {key:1, value: "Cosmetic"},
  {key:2, value: "Drug"},
  {key:3, value: "Food/Supplement"},
  {key:4, value: "Home appliances"},
  {key:5, value: "Goods"},
  {key:6, value: "Etc"}
]

export const CosmeticCategory = [
  {key:1, value: "Skin Care"},
  {key:2, value: "Eye Care"},
  {key:3, value: "Hair Care"},
  {key:4, value: "Others"},
  {key:5, value: "Supplement"},
  {key:6, value: "Men's"}
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
  {"_id": 5, "name": "Food"}
]
// 이미지 등록 또는 수정시 선택항목
export const IMAGES_VISIBLE_ITEM = [
  {"_id": 0, "name": "Invisible"},
  {"_id": 1, "name": "Visible"}
]
// 이미지 등록 또는 수정시 선택항목
export const IMAGES_LANGUAGE = [
  {"_id": 0, "name": "Japanese"},
  {"_id": 1, "name": "Chinese" },
  {"_id": 2, "name": "English" }
]

export const NotSet = "未設定";
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


// LANDING PAGE VIDEO(ロリポップ SERVER)
export const VIDEO_ENGLISH = "https://www.hirosophy.co.jp/test/furuokadrug/samplemotion_en.mp4"
export const VIDEO_JAPANESE = "https://www.hirosophy.co.jp/test/furuokadrug/samplemotion_jp.mp4"
export const VIDEO_CHINESE = "https://www.hirosophy.co.jp/test/furuokadrug/samplemotion_cn.mp4"