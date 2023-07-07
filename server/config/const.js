const MAIN_CATEGORY = [
  {key:0, value: "All"},
  {key:1, value: "Cosmetic"},
  {key:2, value: "Pharmaceuticals"},
  {key:3, value: "Food/Supplement"},
  {key:4, value: "Daily Necessaries"},
  {key:5, value: "Goods"},
  {key:6, value: "Etc"}
]

const CouponType = [
  {key:"0", value: "Gross Percentage"},
  {key:"1", value: "Granting points"},
  {key:"2", value: "Discount amount"}
]

const SaleType = [
  {key:"0", value: "Gross Percentage"},
  {key:"1", value: "Granting points"},
  {key:"2", value: "Discount amount"}
]

const UseWithSale = [
  {key:0, value: "Coupon only"},
  {key:1, value: "Coupon and Sale"},
  {key:2, value: "Sale only"}
]

const NOT_SET = "未設定"
const UNIDENTIFIED = "未確認"
const DeliveryCompleted = "配送手続き完了"
const DEPOSITED = "入金済み"

const AWS_S3 = "S3";
const AWS_SES = "SES";
const AWS_BUCKET_NAME = "furuokadrug-bucket";
const AWS_REGION = "ap-northeast-1"

module.exports = { NOT_SET, UNIDENTIFIED, DeliveryCompleted, DEPOSITED, MAIN_CATEGORY, CouponType, UseWithSale, SaleType, AWS_S3, AWS_SES, AWS_BUCKET_NAME, AWS_REGION };