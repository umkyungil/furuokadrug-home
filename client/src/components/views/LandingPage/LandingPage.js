import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Col, Card, Row, Button } from 'antd';
import ImageSlider from '../../utils/ImageSlider';
import Meta from 'antd/lib/card/Meta';
import CheckBox from './Sections/CheckBox';
import RadioBox from './Sections/RadioBox';
import SearchFeature from './Sections/SearchFeature';
import { continents, price } from './Sections/Datas';
import { PRODUCT_SERVER, SALE_SERVER } from '../../Config.js';
import { SaleType } from '../../utils/Const';
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

function LandingPage() {
	const [Products, setProducts] = useState([]);
	const [Skip, setSkip] = useState(0);
	const [Limit, setLimit] = useState(4)
	const [PostSize, setPostSize] = useState(0)
	const [Filters, setFilters] = useState({
		continents: [],
		price: []
	})
	const [SaleInfos, setSaleInfos] = useState([]); // 세일정보
  const [ShowSaleTotal, setShowSaleTotal] = useState(false);
	
	useEffect(() => {
		// 다국어 설정
		setMultiLanguage(localStorage.getItem("i18nextLng"));
		// 상품 가져오기
		let body = {
			skip: Skip,
			limit: Limit
		}
		const mySale = getSale();
		mySale.then(saleInfos => {
			if (saleInfos) {
				setSaleInfos(saleInfos);
			} else {
				setShowSaleTotal(false);
			}
		})

		getProducts(body);
	}, [localStorage.getItem("i18nextLng")])

	// limit, skip은 mongo의 옵션
	const getProducts = (body) => {
		axios.post(`${PRODUCT_SERVER}/products`, body)
			.then(response => {
					if (response.data.success) {
						// 더 보기 버튼인지 확인
						if (body.loadMore) {
							if (localStorage.getItem('i18nextLng') === "en") {
								response.data.productInfo.map((value, index) => {
									value.title = value.englishTitle;
								})
							} else if (localStorage.getItem('i18nextLng') === "cn") {
								response.data.productInfo.map((value, index) => {
									value.title = value.chineseTitle;
								})
							}

							setProducts([...Products, ...response.data.productInfo]);
						} else {
							if (localStorage.getItem('i18nextLng') === "en") {
								response.data.productInfo.map((value, index) => {
									value.title = value.englishTitle;
								})
							} else if (localStorage.getItem('i18nextLng') === "cn") {
								response.data.productInfo.map((value, index) => {
									value.title = value.chineseTitle;
								})
							}
							
							setProducts(response.data.productInfo);
						}

						setPostSize(response.data.postSize)
					} else {
							alert("Failed to get products.")
					}
			})
	}

	// 더보기 버튼눌렀을때 상품 가져오기
	const loadMoreHandler = () => {
		let skip = Skip + Limit;
		// body 작성
		let body = {
			skip: skip,
			limit: Limit,
			loadMore: true // 더 보기 버튼을 눌렀다는 flag
		}	
		// 상품 가져오기
		getProducts(body);
		// skip정보 status에 보관
		setSkip(skip);
	}

	// 현재날짜가 포함되어 있는세일정보 가져오기
  const getSale = async () => {
		let saleInfos = [];
    try {
      const result = await axios.get(`${SALE_SERVER}/listOfAvailable`);
      if (result.data.success) {
        for (let i=0; i<result.data.saleInfos.length; i++) {
          saleInfos.push(result.data.saleInfos[i]);
        }

        return saleInfos;
      }
    } catch (err) {
      console.log("getSale err: ", err);
    }
  }

	// 카테고리 또는 상품이 지정된 경우 세일금액을 계산한다.
  const calcBySaleItem = (saleInfos, product) => {
    // 상품아이디의 세일정보를 저장(카테고리 ALL인 경우는 상품을 지정할수 없다)
    let saleProduct = [];
    for (let i=0; i<saleInfos.length; i++) {
      // 카테고리와 관계없이 상품아이디 세일정보가 있는경우
      if (!saleInfos[i].except && saleInfos[i].productId !== "") {
        saleProduct.push(saleInfos[i]);
      }
    }
    // 세일대상 제외인 상품아이디 세일정보를 저장
    let exceptProduct = [];
    for (let i=0; i<saleInfos.length; i++) {
      // 카테고리가 세일대상 제외이고 상품아이디가 지정되지 않은경우 
      if (saleInfos[i].except && saleInfos[i].item !== 0 && saleInfos[i].productId !== "") {
        exceptProduct.push(saleInfos[i]);
      } 
    }

    //=================================
    //            세일계산
    //=================================

    // 세일대상 제외 상품인지 확인
    for (let i=0; i<exceptProduct.length; i++) {
      if (exceptProduct[i].productId === product._id) {
        return 0;
      }
    }
    // 상품세일 대상이면 적용
		if (saleProduct.length > 0) {
			for (let i=0; i<saleProduct.length; i++) {
				let price = 0;
				
				// 상품세일의 대상이면 상품의 금액을 구한다
				if (saleProduct[i].productId === product._id) {
					price = Number(product.price);
				}
				// 상품세일에 최소금액이 있는경우 
				if (saleProduct[i].minAmount !== "") {
					const minProductAmount = Number(saleProduct[i].minAmount);
					// 해당 상품의 금액이 최소금액보다 작은경우 세일계산을 하지 않는다
					if (price < minProductAmount) {
						price = 0;
					}
				}
				
				if (price > 0) {
					// 상품세일에 의한 할인금액 또는 포인트를  구한다
					const saleProductAmount  = calcBySaleType(price, saleProduct[i]);
					
					// 상품세일이 포인트 부여인 경우
					if (saleProduct[i].type === SaleType[1].key) {
						return 0;
					} else {
						return saleProductAmount;
					}
				}
			}

			return 0;
		} else {
			return 0;
		}
  }

  // 세일 타입에 의한 할인금액을 구한다
  const calcBySaleType = (targetProductPrice, saleInfo) => {
    // 세일 타입("0": "Gross Percentage", "1": "Granting points", "2": "Discount amount")
    const type = saleInfo.type;
    const amount = Number(saleInfo.amount);
    let discountAmount = 0;
    
    // 0: Gross Percentage(총 금액의 몇 퍼센트 할인)
    if (type === SaleType[0].key) {
      // 전체금액이 아닌 해당상품의 총 금액에서 할인율을 적용한다
      discountAmount = parseInt((targetProductPrice * amount) / 100);
    // 1: Granting points(포인트 부여)
    } else if (type === SaleType[1].key) {
      // 포인트를 돌려준다
      discountAmount = amount;
    // 2: Discount amount(할인금액)
    } else if (type === SaleType[2].key) {
      discountAmount = amount
    }

    return discountAmount;
  }

	// 상품별 카드를 생성
	const renderCards = Products.map((product, index) => {
		// 상품가격에 콤마 추가
		const price = Number(product.price).toLocaleString();
		// 세일계산
		let saleAmount = calcBySaleItem(SaleInfos, product);
		const minusSalesAmount = Number(product.price) - saleAmount;

		// 한 Row는 24사이즈 즉 카드 하나당 6사이즈로 하면 화면에 4개가 표시된다 
		// lg: 화면이 가장 클때, md: 중간 
		return <Col lg={6} md={8} xs={24} key={index} > 
			<Card
				// ImageSlider에 images라는 이름으로 데이터를 넘김
				cover={<a href={`/product/${product._id}`}><ImageSlider images={product.images}/></a>} 
			>	
				<Meta 
					title={product.title}
					// 세일값이 있으면 원래 가격을 보여주고 삭제표시를 하고 세일값이 없으면 아무것도 안보여준다
					description={<span style={{textDecoration:"line-through"}}>{saleAmount > 0 ? price:undefined}</span>}
				/>
				{/* 세일로 계산된 상품이 있으면 카드의 왁구를 맞추기 위해서 개행을 넣는다 */}
				{saleAmount < 1 && 
					<br />
				}
				{/* 세일로 계산된 값 또는 원래 상품값을 표시한다 */}
				<b>{minusSalesAmount.toLocaleString()} (JPY)</b>
			</Card>
		</Col>
	});

	// 라디오 또는 체크박스 눌렀을때 상품검색해서 가져오기
	const showFilteredResults = (filters) => {
		let body = {
			skip: 0,
			limit: Limit,
			filters: filters
		}

		// 상품 가져오기
		getProducts(body);
		// Skip정보 보관하기(body에서 0으로 했기때문에 0으로 변경)
		setSkip(0);
	}

	// 화면에서 선택한 라디오 버튼의 값을 가져오기
	const handlePrice = (value) => {
		// price전체 데이터
		const data = price;
		let array = [];

		for (let key in data) {
			if (data[key]._id === parseInt(value, 10)) {
				array = data[key].array;
			}
		}

		return array;
	}

	// 라디오 또는 체크박스 선택했을 때 처리
	const handleFilters = (filters, category) => {
		const newFilters = {...Filters };
		newFilters[category] = filters;

		if (category === "price") {
			let priceValues = handlePrice(filters);
			newFilters[category] = priceValues;
		}

		showFilteredResults(newFilters);
		setFilters(newFilters);
	}

	// 키워드 검색시 상품 가져오기
	const updateSearchTerm = (newSearchTerm) => {		
		let body = {
			skip:0,
			limit:Limit,
			filters:Filters,
			searchTerm: newSearchTerm
		}

		setSkip(0);
		getProducts(body);
	}

	// 다국적언어
	const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);
  }

	return (
		<div style={{ width:'75%', margin:'3rem auto' }}>
			<div style={{ textAlign:'center' }}>
				<h1>{t('Landing.title')}</h1>
			</div>

			{/* Filter */}
			<Row gutter={[16, 16]}>{/* gutter 여백 */}
				<Col lg={12} xs={24}>
					{/* CheckBox */}
					<CheckBox list={continents} handleFilters={filters => handleFilters(filters, "continents")}/>
				</Col>
				<Col lg={12} xs={24}>
					{/* RadioBox */}
					<RadioBox list={price} handleFilters={filters => handleFilters(filters, "price")}/>
				</Col>
			</Row>

			{/* Search */}
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={updateSearchTerm}/>
			</div>

			{/* Cards */}

			{/* gutter: 카드의 여백 설정 */}
			<Row gutter={[16, 16]}>
				{renderCards}
			</Row>

			<br />
			{/* PostSize가 Limit보다 크거나 같으면 더보기 버튼을 보여주는 조건 */}
			{/* PostSize: Product Size */}
			{PostSize >= Limit && 
				<div style={{ display:'flex', justifyContent:'center' }}>
					<Button onClick={loadMoreHandler}>More</Button>
				</div>
			}
		</div>
	)
}

export default LandingPage