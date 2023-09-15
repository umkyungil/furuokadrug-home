import React, { useEffect, useState, useContext, useRef } from 'react';
import { Col, Card, Row, Button, Tag, Empty } from 'antd';
import ImageSlider from '../../utils/ImageSlider';
import Meta from 'antd/lib/card/Meta';
import { PRODUCT_SERVER, SALE_SERVER } from '../../Config.js';
import { I18N_JAPANESE, I18N_CHINESE, SaleType, PRODUCT_LIST_CATEGORY, PRODUCT_VISIBLE_TYPE, SALE_TAG, NOTICE_TAG } from '../../utils/Const';
import { useTranslation } from 'react-i18next';
import cookie from 'react-cookies';
import { LanguageContext } from '../../context/LanguageContext';
import './Sections/product.css';
import { getLanguage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

const blankTag = {
	borderStyle: 'none',
  top: "150px",
  left: "165px",
  width: "60px",
  height: "24px",
  color: "#ffffff",
  background: "#ffffff",
}

function ProductListPage(props) {
	const [Products, setProducts] = useState([]);
	const [SaleInfos, setSaleInfos] = useState([]);
	const [ShowSuccess, setShowSuccess] = useState(false);
	const [ShowMore, setShowMore] = useState(false);

	const skipRef = useRef(0);
	const postSizeRef = useRef(0);
	const typeRef = useRef(0);
	const categoryRef = useRef(0);
	const newSearchTermRef = useRef("");
	const limitCount = 20;

  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

	useEffect(() => {
		// 다국적언어 설정
		getLanguage();
		// 스크롤을 Top으로 이동시킨다
		scrollToTop();
		// 메인처리
		process();
	}, [props.match.params.type, props.match.params.category, props.match.params.searchTerm])

	const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

	const getLanguage = () => {
    if (!isLanguage || isLanguage === "") {
      let lan = localStorage.getItem("i18nextLng");
      
      if (lan) {
        if (lan === 'ja-JP') {
          lan = "en";
          localStorage.setItem('i18nextLng', lan);
          i18n.changeLanguage(lan);
        } else {
          i18n.changeLanguage(lan);
        }
      } else {
        lan = "en";
        localStorage.setItem('i18nextLng', lan);
        i18n.changeLanguage(lan);
      }

      setIsLanguage(lan);

    } else {
			i18n.changeLanguage(isLanguage);	
		}
  }

	// 메인 처리(프로세스)
	const process = async () => {
    // 세일정보 가져오기
		await getSale();

		// 화면 노출타입 검색 (3: Sale, 4: Recommend)
		if (props.match.params.type) {
			// 노출 검색정보를 저장
			typeRef.current = Number(props.match.params.type);
			// 키워드 검색정보를 초기화
			newSearchTermRef.current = "";
			// 카테고리 검색정보를 초기화
			categoryRef.current = 0;
			// 상품 가져오기
			await getProductsByType({skip: skipRef.current, limit: limitCount, type: typeRef.current});
		}

		// 카테고리 검색
		if (props.match.params.category) {
			let category = Number(props.match.params.category);
			
			// 카테고리에서 추천 또는 세일을 선택한 경우
			if (category === PRODUCT_LIST_CATEGORY[7].key || category === PRODUCT_LIST_CATEGORY[8].key) {
				// 노출 검색정보를 저장
				if (category === PRODUCT_LIST_CATEGORY[7].key) {
					// 추천상품인 경우
					typeRef.current = PRODUCT_VISIBLE_TYPE[3].key;
				} else if (category === PRODUCT_LIST_CATEGORY[8].key) {
					// 세일상품인 경우
					typeRef.current = PRODUCT_VISIBLE_TYPE[4].key;
				}
				// 키워드 검색정보를 초기화
				newSearchTermRef.current = "";
				// 카테고리 검색정보를 초기화
				categoryRef.current = 0;
				// 상품 가져오기
				await getProductsByType({skip: skipRef.current, limit: limitCount, type: typeRef.current});

			} else {
				// 카테고리 검색정보를 저장
				categoryRef.current = Number(props.match.params.category);
				// 키워드 검색정보를 초기화
				newSearchTermRef.current = "";
				// 노출 검색정보를 초기화
				typeRef.current = 0;
				// 재 검색이니까 skip=0으로 한다
				let body = { skip: 0, limit: limitCount, continents: categoryRef.current }
				// 상품 가져오기
				await getProducts(body);
				// Skip정보 보관하기(body에서 0으로 설정 했기때문에 0으로 변경)
				skipRef.current = 0;
			}
		}

		// 키워드 검색
		if (props.match.params.searchTerm) {			
			// 키워드 검색정보를 저장
			newSearchTermRef.current = props.match.params.searchTerm;
			// 카테고리 검색정보를 저장
			categoryRef.current = 0;
			// 노출 검색정보를 초기화
			typeRef.current = 0;

			let body = { skip: 0, limit: limitCount,	searchTerm: newSearchTermRef.current }
			// 상품 가져오기
			await getProducts(body);
			// Skip정보 보관하기(body에서 0으로 설정 했기때문에 0으로 변경)
			skipRef.current = 0;
		}
  }

	const getProductsByType = async (body) => {
		try {
			// 회원, 비회원 구분으로 상품을 가져오기 위해서
			body.id = localStorage.getItem('userId');
			const response = await axios.post(`${PRODUCT_SERVER}/products_by_type`, body);
			const products = response.data;

			if (products.productInfos) {
				if (isLanguage === I18N_CHINESE) {
					for (let i=0; i<products.productInfos.length; i++) {
						products.productInfos[i].title = products.productInfos[i].chineseTitle;
					}
				} else if (isLanguage === I18N_JAPANESE) {
					for (let i=0; i<products.productInfos.length; i++) {
						products.productInfos[i].title = products.productInfos[i].title;
					}
				} else {
					for (let i=0; i<products.productInfos.length; i++) {
						products.productInfos[i].title = products.productInfos[i].englishTitle;
					}
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

				setShowSuccess(true);
			} else {
				// 검색결과가 없는 경우
				setShowSuccess(false);
			}
		} catch (err) {
			console.log("err: ", err);
			alert("Please contact the administrator");
			listHandler();
		}
	}

	// limit, skip은 mongo의 옵션
	const getProducts = async (body) => {
		try {
			// 회원, 비회원 구분으로 상품을 가져오기 위해서
			if (localStorage.getItem('userId') && cookie.load('w_auth')) {
				body.id = localStorage.getItem('userId');
				body.language = isLanguage;
			} else {
				body.id = "";
				body.language = isLanguage;
			}
			
			const response =  await axios.post(`${PRODUCT_SERVER}/list`, body);
			const products = response.data;
			if (products.productInfo) {
				if (isLanguage === I18N_JAPANESE) {
					for (let i=0; i<products.productInfo.length; i++) {
						products.productInfo[i].title = products.productInfo[i].title;
					}
				} else if (isLanguage === I18N_CHINESE) {
					for (let i=0; i<products.productInfo.length; i++) {
						products.productInfo[i].title = products.productInfo[i].chineseTitle;
					}
				} else {
					for (let i=0; i<products.productInfo.length; i++) {
						products.productInfo[i].title = products.productInfo[i].englishTitle;
					}
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
				if (postSizeRef.current > limitCount) {
					setShowMore(true);
				} else {
					setShowMore(false);
				}

				setShowSuccess(true);
			} else {
				// 검색결과가 없는 경우
				setShowSuccess(false);
			}
		} catch (err) {
			console.log("err: ", err);
			alert("Please contact the administrator");
			listHandler();
		}
	}

	// 더보기 버튼눌렀을때 상품 가져오기
	const loadMoreHandler = async () => {
		let tmpSkip = skipRef.current + limitCount;

		// body 작성(// 더 보기 버튼을 눌렀다는 flag )
		let body = { skip: tmpSkip,	limit: limitCount, 	loadMore: true };

		// 노출상품 검색인 경우
		if (typeRef.current !== 0) {
			body.type = typeRef.current;
			// 상품 가져오기
			await getProductsByType(body);
		} else if (categoryRef.current !== 0) {
			// 카테고리 검색인 경우 상품 가져오기
			body.continents = categoryRef.current;
			await getProducts(body);
		} else if (newSearchTermRef.current !== "") { 
			// 키워드 검색인 경우 상품 가져오기
			body.searchTerm = newSearchTermRef.current;
			await getProducts(body);
		}	
		
		// 다음 more버튼 검색을 위해 skip정보 보관
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
		// 세일계산
		let saleAmount = calcBySaleItem(SaleInfos, product);
		let minusSalesAmount = Number(product.price) - saleAmount;

		let isSaleTag = false;
		let isRecTag = false;
		for (let i = 0; i < product.exposureType.length; i++) {
			if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[3].key) {
				isRecTag = true;
			} 
			if (product.exposureType[i] === PRODUCT_VISIBLE_TYPE[4].key) {
				isSaleTag = true;
			} 
		}

		// 한 Row는 24사이즈 즉 카드 하나당 6사이즈로 하면 화면에 4개가 표시된다 
		// lg: 화면이 가장 클때, md: 중간 
		return <Col lg={6} md={8} xs={24} key={index} > 
			<Card 
				// ImageSlider에 images라는 이름으로 데이터를 넘김
				cover={<a href={`/product/${product._id}`}><ImageSlider images={product.images}/></a>} 
			>	
				{isLanguage === "cn" &&
					<span className='lanCN'>
						<Meta title={product.title}
							// 세일값이 있으면 원래 가격을 보여주고 삭제표시를 하고 세일값이 없으면 아무것도 안보여준다
							// description={<span style={{textDecoration:"line-through"}}>{saleAmount > 0 ? price:undefined}</span>}
						/>
					</span>
				}
				{isLanguage !== "cn" &&
					<span className='lanJP'>
						<Meta title={product.title} />
					</span>
				}
				{/* 세일로 계산된 상품이 있으면 카드의 왁구를 맞추기 위해서 개행을 넣는다 */}
				{saleAmount < 1 && 
					<br />
				}
				{/* 세일로 계산된 값 또는 원래 상품값을 표시한다 */}
				<b>{minusSalesAmount.toLocaleString()} (JPY)</b>
				{/* &nbsp;&nbsp; */}
				<br />
				{ isSaleTag && <Tag color="#f50" >&nbsp;&nbsp;{SALE_TAG}&nbsp;&nbsp;</Tag>	}
				{ isRecTag && <Tag color="#fa0" >{NOTICE_TAG}</Tag> }
				{/* 태그가있는 경우 폼이 이상해 지기때문에 태그가 없는 상품에 블랭크 태그를 두개 추가 */}
				{ !isSaleTag && !isRecTag &&
					<>
						<Tag style={blankTag} >blank</Tag>
						<Tag style={blankTag} >blank</Tag>
					</>
				}				
			</Card>
		</Col>
	});

	// Landing pageへ戻る
  const listHandler = () => {
    props.history.push('/')
  }

	return (
		<div style={{ width:'75%', margin:'3rem auto' }}>
			{isLanguage === "cn" && 
				<div className='lanCP' style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
					<h1>{t('Product.listTitle')}</h1>
				</div>
      }
			{isLanguage !== "cn" && 
				<div className='lanJP' style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
					<h1>{t('Product.listTitle')}</h1>
				</div>
      }

			{/* 검색결과가 있는 경우 리스트를 보여 주고 없는 경우 Empty화면을 보여준다 */}
			{ ShowSuccess ?
				<>
					{/* Cards */}
					{/* gutter={[16, 16]}: [옆 카드사이의 여백, 위 아래 카드사이의 여백] */}
					<Row gutter={[16, 16]}>
						{renderCards} 
					</Row>

					<br />
				
					{/* PostSize가 Limit보다 크거나 같으면 더보기 버튼을 보여주는 조건 */}
					{/* PostSize: Product Size */}
					{ ShowMore && 
						<div style={{ display:'flex', justifyContent:'center' }}>
							<Button type="primary" onClick={loadMoreHandler}>More</Button>
						</div>
					}
				</>
			:	
				<>
					<br />
					<br />
					<br />
					<Empty description={false} />
					<br />
					<br />
					<br />
					<br />
					<br />
					<div style={{ display:'flex', justifyContent:'center' }}>
						<Button type="primary" onClick={listHandler}>
							Landing Page
						</Button>
					</div>
				</>
			}
		</div>
	)
}

export default ProductListPage;