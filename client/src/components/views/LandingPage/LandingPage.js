import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Icon, Col, Card, Row } from 'antd';
import ImageSlider from '../../utils/ImageSlider';
import Meta from 'antd/lib/card/Meta';
import CheckBox from './Sections/CheckBox';
import { continents } from './Sections/Datas';

function LandingPage() {

	const [Products, setProducts] = useState([]);
	const [Skip, setSkip] = useState(0);
	const [Limit, setLimit] = useState(8)
	const [PostSize, setPostSize] = useState(0)

	useEffect(() => {
		let body = {
			skip: Skip,
			limit: Limit
		}

		// 제일 처음 상품을 가지고 온다
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

	const loadMoreHandler = () => {
		let skip = Skip + Limit;

		let body = {
			skip: Skip,
			limit: Limit,
			loadMore: true // 더 보기 버튼을 눌렀다는 flag
		}
		
		getProducts(body);
		setSkip(skip);
	}

	// 상품별 카드를 생성
	const renderCards = Products.map((product, index) => {
		// 한 Row는 24사이즈 즉 카드 하나당 6사이즈로 하면 화면에 4개가 표시된다 
		// lg: 화면이 가장 클때, md: 중간 
		return <Col lg={6} md={8} xs={24} key={index} > 
			<Card
				cover={ <ImageSlider images={product.images}/> } // ImageSlider에 images라는 이름으로 데이터를 넘김
			>
				<Meta 
					title={product.title}
					description={`¥${product.price}`}
				/>
			</Card>
		</Col>
	});

	const handleFilters = () => {

	}

	return (
		<div style={{ width:'75%', margin:'3rem auto' }}>
			<div style={{ textAlign:'center' }}>
				<h2>Product List<Icon type="rocket" /></h2>
			</div>

			{/* Filter */}

			{/* CheckBox */}
			<CheckBox list={continents} handleFilters={filter => handleFilters(filter, "continents")}/>

			{/* Search */}

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
