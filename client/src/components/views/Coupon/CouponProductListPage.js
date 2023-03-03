import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Table, Button } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { PRODUCT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { MAIN_CATEGORY } from '../../utils/Const';
import { LanguageContext } from '../../context/LanguageContext';
// CORS 대책
axios.defaults.withCredentials = true;

const items = MAIN_CATEGORY;

function CouponProductListPage(props) {
	const [Products, setProducts] = useState([]);
	const [Item, setItem] = useState(0);
	const { isLanguage, setIsLanguage } = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

	useEffect(() => {
		i18n.changeLanguage(isLanguage);

		// query string 가져오기
		const item = props.match.params.item;
		setItem(item);
		// 사용자정보 취득	
		let body = { item: item, searchTerm: ""	}
		getProducts(body);
	}, [])

	const columns = [
    {
      title: t('Product.productName'),
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: t('Product.category'),
      dataIndex: 'continents',
      key: 'continents',
    },
    {
      title: t('Product.priceDisplay'),
      dataIndex: 'price',
      key: 'price',
    },
		{
			title: t('Product.action'),
			key: 'action',
			render: (_, record) => (
				<>
					<Button type="link" onClick={(e) => {clickHandler(record._id, e)}} >select</Button>
				</>
			),
		},
  ];

	// 상품정보 가져오기
	const getProducts = async (body) => {
		let data = [];
    let count = 0;
		
		try {
			const result = await axios.post(`${PRODUCT_SERVER}/coupon/list`, body);
			if (result.data.success)  {
				for (let i=0; i<result.data.productInfo.length; i++) {
					count++;

					// 아이템 값 변경
					items.map(item => {
						if (item.key === Number(result.data.productInfo[i].continents)) {
							result.data.productInfo[i].continents = item.value;
						}
					})
					// 메일전송　타입추가
					result.data.productInfo[i].type = 'Coupon';
					// key 추가
          result.data.productInfo[i].key = count;
					data.push(result.data.productInfo[i]);
				}

				setProducts([...data]);
			}
		} catch (err) {
			console.log("getProducts err: ",err);
		}
	}

	// 키워드 검색시 고객정보가져오기
	const updateSearchTerm = (newSearchTerm) => {
		let body = {
			item: Item,
			searchTerm: newSearchTerm
		}

		getProducts(body);
	}

	// 부모창의 함수를 호출해서 userId를 전달
	const clickHandler = (params, e) => {
		window.opener.productClickHandler(params);
		window.close();
	}

	return (
		<div style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center' }}>
				<h1>{t('Product.listTitle')}</h1>
			</div>

			{/* Filter */}
			{/* Search */}
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={updateSearchTerm}/>
			</div>
			{/* Search */}

			<Table columns={columns} dataSource={Products} />
		</div>	
	)
}

export default CouponProductListPage