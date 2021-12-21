import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Icon, Col, Card, Row } from 'antd';
import ImageSlider from '../../utils/ImageSlider';
import Meta from 'antd/lib/card/Meta';
import CheckBox from './Sections/CheckBox';
import RadioBox from './Sections/RadioBox';
import SearchFeature from './Sections/SearchFeature';
import { continents, price } from './Sections/Datas';

function LandingPage() {

	const [Products, setProducts] = useState([]);
	const [Skip, setSkip] = useState(0);
	const [Limit, setLimit] = useState(8)
	const [PostSize, setPostSize] = useState(0)
	const [Filters, setFilters] = useState({
		continents: [],
		price: []
	})
	const [SearchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		let body = {
			skip: Skip,
			limit: Limit
		}

		// 상품 가져오기
		getProducts(body);
	}, [])

	// limit, skip은 mongo의 옵션
	const getProducts = (body) => {
		axios.post('/api/product/products', body)
			.then(response => {
					if (response.data.success) {
						// 더 보기 버튼인지 확인
						if (body.loadMore) {
							setProducts([...Products, ...response.data.productInfo]);
						} else {
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

		let body = {
			skip: Skip,
			limit: Limit,
			loadMore: true // 더 보기 버튼을 눌렀다는 flag
		}
		
		// 상품 가져오기
		getProducts(body);
		// skip정보 status에 보관
		setSkip(skip);
	}

	// 상품별 카드를 생성
	const renderCards = Products.map((product, index) => {
		// 한 Row는 24사이즈 즉 카드 하나당 6사이즈로 하면 화면에 4개가 표시된다 
		// lg: 화면이 가장 클때, md: 중간 
		return <Col lg={6} md={8} xs={24} key={index} > 
			<Card
				// ImageSlider에 images라는 이름으로 데이터를 넘김
				cover={<a href={`/product/${product._id}`}><ImageSlider images={product.images}/></a>} 
			>
				<Meta 
					title={product.title}
					description={`¥${product.price}`}
				/>
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
		setSearchTerm(newSearchTerm);

		getProducts(body);
	}

	return (
		<div style={{ width:'75%', margin:'3rem auto' }}>
			<div style={{ textAlign:'center' }}>
				<h2>Product List<Icon type="rocket" /></h2>
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

			{/* PostSize가 Limit보다 크거나 같으면 더보기 버튼을 보여주는 조건 */}
			{/* PostSize: Product Size */}
			{PostSize >= Limit && 
				<div style={{ display:'flex', justifyContent:'center' }}>
					<button onClick={loadMoreHandler}>More</button>
				</div>
			}	

		</div>
	)
}

export default LandingPage
