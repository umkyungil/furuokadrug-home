const NotSet = "未設定"
const Unidentified = "未確認"
const DeliveryCompleted = "配送手続き完了"
const Deposited = "入金済み"

const MainCategory = [
  {key:0, value: "All"},
  {key:1, value: "Cosmetic"},
  {key:2, value: "Drug"},
  {key:3, value: "Food/Supplement"},
  {key:4, value: "Home appliances"},
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

module.exports = { NotSet, Unidentified, DeliveryCompleted, Deposited, MainCategory, CouponType, UseWithSale, SaleType };