import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import styles from '../LandingPage/LandingPage.module.css';
import { Col, Card, Row, Button, Tag } from 'antd';
import ImageSlider from '../../utils/ImageSlider';
import Meta from 'antd/lib/card/Meta';
import CheckBox from './Sections/CheckBox';
import RadioBox from './Sections/RadioBox';
import SearchFeature from './Sections/SearchFeature';
import { PRODUCT_SERVER, SALE_SERVER } from '../../Config.js';
import { I18N_ENGLISH, I18N_CHINESE, SaleType, PRODUCT_LIST_CATEGORY, PRICE, PRODUCT_VISIBLE_TYPE, SALE_TAG, NOTICE_TAG } from '../../utils/Const';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
// CORS 대책
axios.defaults.withCredentials = true;

const onAirSale = {
  fontSize: "12px",
  fontWeight: "bold",
  top: "150px",
  left: "165px",
  width: "60px",
  height: "25px",
  color: "#ffffff",
  background: "#ff0404",
  textAlign: "center"
}

const onAirNotice = {
  fontSize: "12px",
  fontWeight: "bold",
  top: "150px",
  left: "165px",
  width: "60px",
  height: "25px",
  color: "#ffffff",
  background: "#ff8800",
  textAlign: "center"
}

function ProductListPage(props) {
	const [Products, setProducts] = useState([]);
	const [Filters, setFilters] = useState({continents: [], price: []	})
	const [SaleInfos, setSaleInfos] = useState([]); // 세일정보

	const skipRef = useRef(0);
	const limitRef = useRef(20);
	const postSizeRef = useRef(0);
	const typeRef = useRef(0);
	const categoryRef = useRef(0);
	const newSearchTermRef = useRef("");
	
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

	useEffect(() => {
		// 다국적언어 설정
		i18n.changeLanguage(isLanguage);

		process();
	}, [props.match.params.type, props.match.params.category, props.match.params.searchTerm])

	const process = async () => {
    // 세일정보 가져오기
		await getSale();

		// 화면 노출타입 검색 Landing page(3: Sale, 4: Recommend)
		if (props.match.params.type) {
			// 노출 검색정보를 저장
			typeRef.current = Number(props.match.params.type);
			// 키워드 검색정보를 초기화
			newSearchTermRef.current = "";
			// 카테고리 검색정보를 초기화
			categoryRef.current = 0;
			// 상품 가져오기
			await getProductsByType({skip: skipRef.current, limit: limitRef.current, type: typeRef.current});
		}
		// 카테고리 검색
		if (props.match.params.category) {
			// 카테고리 검색정보를 저장
			categoryRef.current = Number(props.match.params.category);
			// 노출 검색정보를 초기화
			typeRef.current = 0;
			// 키워드 검색정보를 초기화
			newSearchTermRef.current = "";

			let arr = [];
			arr.push(props.match.params.category);
			// 상품 가져오기(배열로 넘긴다)
			handleFilters(arr, "continents")
		}
		// 키워드 검색
		if (props.match.params.searchTerm) {			
			// 키워드 검색정보를 저장
			newSearchTermRef.current = props.match.params.searchTerm;
			// 카테고리 검색정보를 저장
			categoryRef.current = 0;
			// 노출 검색정보를 초기화
			typeRef.current = 0;
			// 상품 가져오기
			await updateSearchTerm(props.match.params.searchTerm)
		}
  }

	const getProductsByType = async (body) => {
		const response = await axios.post(`${PRODUCT_SERVER}/products_by_type`, body)
		const products = response.data;

		// 키워드 검색시 문자 하나하나로 검색을 하기때문에 success로 조건을 줘야헌다
		if (products.success) {
			if (isLanguage === I18N_ENGLISH) {
				products.productInfos.map((value) => {
					value.title = value.englishTitle;
				})
			} else if (isLanguage === I18N_CHINESE) {
				products.productInfos.map((value) => {
					value.title = value.chineseTitle;
				})
			}
			
			// 더 보기 버튼인지 확인
			if (body.loadMore) {
				// 기존 상품에 검색한 상품을 추가한다
				setProducts([...Products, ...products.productInfos]);
			} else {
				setProducts(products.productInfos);
			}
			// 검색한 상품의 갯수
			postSizeRef.current = Number(products.productInfos.length);
		} else {
			alert("Please contact the administrator")
		}
	}
	

	// limit, skip은 mongo의 옵션
	const getProducts = async (body) => {
    const response =  await axios.post(`${PRODUCT_SERVER}/list`, body);
		const products = response.data;

		// 키워드 검색시 문자 하나하나로 검색을 하기때문에 success로 조건을 줘야헌다
		if (products.success) {
			if (isLanguage === I18N_ENGLISH) {
				products.productInfo.map((value) => {
					value.title = value.englishTitle;
				})
			} else if (isLanguage === I18N_CHINESE) {
				products.productInfo.map((value) => {
					value.title = value.chineseTitle;
				})
			}	
			
			// 더 보기 버튼인지 확인
			if (body.loadMore) {
				// 기존 상품에 검색한 상품을 추가한다
				setProducts([...Products, ...products.productInfo]);
			} else {
				setProducts(products.productInfo);
			}
			// 검색한 상품의 갯수
			postSizeRef.current = Number(products.postSize);
		} else {
			alert("Please contact the administrator")
		}
	}

	// 더보기 버튼눌렀을때 상품 가져오기
	const loadMoreHandler = async () => {
		let tmpSkip = skipRef.current + limitRef.current;

		// body 작성
		let body = {
			skip: tmpSkip,
			limit: limitRef.current,
			loadMore: true // 더 보기 버튼을 눌렀다는 flag
		}

		// 노출상품 검색
		if (typeRef.current !== 0) {
			body.type = typeRef.current;
			// 상품 가져오기
			await getProductsByType(body);
		}
		// 카테고리 상품 검색
		if (categoryRef.current !== 0) {
			let arr = [categoryRef.current];
			// 기존의 배열값인 객체를 대입한다
			const newFilters = {...Filters };
			newFilters["continents"] = arr;
			setFilters(newFilters);
			body.filters = newFilters;
			// 상품 가져오기
			await getProducts(body);
		}
		// 키워드 상품 검색
		if (newSearchTermRef !== "") {
			body.searchTerm = newSearchTermRef;
			// 상품 가져오기
			await getProducts(body);
		}	
		
		// more버튼 검색을 위해 skip정보 보관
		skipRef.current = tmpSkip;
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
				setSaleInfos(saleInfos);
      }
    } catch (err) {
      console.log("err: ", err);
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
        return false;
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
						return false;
					} else {
						return saleProductAmount;
					}
				}
			}

			return false;
		} else {
			return false;
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

		let isSale = false;
		let isRecommended = false;
		let exposureType = product.exposureType;

		console.log("product.exposureType: ", product.exposureType);
		
		for (let i = 0; i < product.exposureType.length; i++) {
			if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[3].key) {
				isRecommended = true;
			} 
			if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[4].key) {
				isSale = true;
			} 
		}

		console.log("isSale: ", isSale);
		console.log("isRecommended: ", isRecommended);

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
				&nbsp;&nbsp;
				{isSale && 
					<Tag style={onAirSale} >{SALE_TAG}</Tag>
				}
				{isRecommended && 
					<Tag style={onAirNotice} >{NOTICE_TAG}</Tag>
				}
			</Card>
		</Col>
	});

	// 라디오 또는 체크박스 눌렀을때 상품검색해서 가져오기
	const showFilteredResults = async (filters) => {
		// 재 검색이니까 skip=0으로 한다
		let body = {
			skip: 0,
			limit: limitRef.current,
			filters: filters
		}
		// 상품 가져오기
		await getProducts(body);
		// Skip정보 보관하기(body에서 0으로 했기때문에 0으로 변경)
		skipRef.current = 0;
	}

	// 화면에서 선택한 라디오 버튼의 값을 가져오기
	const handlePrice = (value) => {
		// price전체 데이터
		const data = PRICE;
		let array = [];

		for (let key in data) {
			if (data[key]._id === parseInt(value, 10)) {
				array = data[key].array;
			}
		}

		return array;
	}

	// 라디오 또는 체크박스 선택했을 때 처리
	const handleFilters = async (filters, category) => {
		// 기존의 배열값인 객체를 대입한다
		const newFilters = {...Filters };
		// 객체안의 배열에 값을 입력
		newFilters[category] = filters;

		if (category === "price") {
			let priceValues = handlePrice(filters);
			newFilters[category] = priceValues;
		}

		setFilters(newFilters);
		await showFilteredResults(newFilters);
	}

	// 키워드 검색시 상품 가져오기
	const updateSearchTerm = async (newSearchTerm) => {
		let body = {
			skip:0,
			limit:limitRef.current,
			searchTerm: newSearchTerm
		}
		
		await getProducts(body);
		// Skip정보 보관하기(body에서 0으로 했기때문에 0으로 변경)
		skipRef.current = 0;
	}

	return (
		<div style={{ width:'75%', margin:'3rem auto' }}>
			<br />
			<br />
			<br />
			<div style={{ textAlign:'center' }}>
				<h1>{t('Product.listTitle')}</h1>
			</div>

			{/* Filter */}
			{/* gutter 여백 */}
			{/* <Row gutter={[16, 16]}>
				<Col lg={12} xs={24}>
					<CheckBox list={PRODUCT_LIST_CATEGORY} handleFilters={filters => handleFilters(filters, "continents")}/>
				</Col>
				<Col lg={12} xs={24}>
					<RadioBox list={PRICE} handleFilters={filters => handleFilters(filters, "price")}/>
				</Col>
			</Row> */}

			{/* Search */}
			{/* <div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={updateSearchTerm}/>
			</div> */}

			{/* Cards */}
			{/* gutter={[16, 16]}: [옆 카드사이의 여백, 위 아래 카드사이의 여백] */}
			<Row gutter={[16, 16]}>
				{renderCards}
			</Row>

			<br />
			{/* PostSize가 Limit보다 크거나 같으면 더보기 버튼을 보여주는 조건 */}
			{/* PostSize: Product Size */}
			{postSizeRef.current >= limitRef.current && 
				<div style={{ display:'flex', justifyContent:'center' }}>
					<Button onClick={loadMoreHandler}>More</Button>
				</div>
			}
		</div>
	)
}

export default ProductListPage;