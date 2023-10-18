import React, { useEffect, useState, useContext, useRef } from 'react';
import { Table } from 'antd';
import { PRODUCT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { MAIN_CATEGORY, PRODUCT_VISIBLE_TYPE } from '../../utils/Const.js'
import { getLocalTime } from '../../utils/CommonFunction.js';
import SearchFeatureAdmin from './Sections/SearchFeatureAdmin';
import { useHistory } from 'react-router-dom';

import { LanguageContext } from '../../context/LanguageContext.js';
import './Sections/product.css';
import { getLanguage, setHtmlLangProps } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function ProductListAdminPage() {
	const history = useHistory();

	const skipRef = useRef(0);
	const typeRef = useRef(0);
	const categoryRef = useRef(0);
	const newSearchTermRef = useRef("");
	const limitCount = 20;

	const [Products, setProducts] = useState([]);
	const {isLanguage, setIsLanguage} = useContext(LanguageContext);
	const {t, i18n} = useTranslation();

	useEffect(() => {
		// 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

		// HTML lang속성 변경
    setHtmlLangProps(lang);

		// 메인처리
		process();
	}, [isLanguage])

	const process = async () => {
		await getProducts();
	}

	// 상품정보 가져오기
	const getProducts = async () => {
		let data = [];
    let count = 0;
		
		try {
			const result = await axios.get(`${PRODUCT_SERVER}/list`);

			if (result.data.success)  {
				for (let i=0; i<result.data.productInfos.length; i++) {
					count++;

					const productInfos = result.data.productInfos;
					// 상품 카테고리 데이터 변경
					for (let j=0; j<MAIN_CATEGORY.length; j++) {
						if (productInfos[i].continents === MAIN_CATEGORY[j].key) {
							productInfos[i].continents = MAIN_CATEGORY[j].value;
						}
					}

					// 상품 노출 데이터 변경
					if (productInfos[i].exposureType.length > 0) {
						for (let j=0; j<PRODUCT_VISIBLE_TYPE.length; j++) {
							if (productInfos[i].exposureType[0] === PRODUCT_VISIBLE_TYPE[j].key) {
								productInfos[i].exposureType[0] = PRODUCT_VISIBLE_TYPE[j].value;
							}
						}
					}
					
					// 상품 등록일
					productInfos[i].createdAt = getLocalTime(productInfos[i].createdAt)
					
					// key 추가
          productInfos[i].key = count;
					data.push(productInfos[i]);
				}
				
				setProducts([...data]);
			}
		} catch (err) {
			console.log("err: ",err);
		}
	}

	const getProductsByTypeForAdmin = async (body) => {
		try {
			const response = await axios.post(`${PRODUCT_SERVER}/products_by_type_for_admin`, body);
			const products = response.data;
										
			setProducts(products.productInfos);
		} catch (err) {
			console.log("err: ", err);
			alert("Please contact the administrator");
		}
	}


	const columns = [
		{
      title: t('Product.japaneseTitle'),
      dataIndex: 'title',
      key: 'title'
    },
		{
      title: t('Product.price'),
      dataIndex: 'price',
      key: 'price'
    },
		{
      title: t('Product.contents'),
      dataIndex: 'contents',
      key: 'contents'
    },
		{
      title: t('Product.category'),
      dataIndex: 'continents',
      key: 'continents'
    },
		{
      title: t('Product.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
		{
			title: t('Product.action'),
			key: 'action',
			render: (_, record) => (
				<>
					<a href={`/product/update/${record._id}`}>edit</a>&nbsp;&nbsp;
				</>
			),
		},
  ];

	// 상품의 태그정보 검색
	const tagSearchTerm = async (newSearchTerm) => {
		if (localStorage.getItem("userId")) {
			let userId = localStorage.getItem("userId");
			let body = { 
				searchTerm: newSearchTerm, 
				id: userId
			}

			// 화면 노출타입 검색 (3: Sale, 4: Recommend)
			typeRef.current = Number(newSearchTerm);
			// 상품 가져오기
			await getProductsByTypeForAdmin({ type: typeRef.current });
		
		} else {
			alert("Please login");
			history.push("/login");
		}
	}

	return (
		<div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center', paddingTop: '38px' }}>
				<h1>{t('Product.listAdminTitle')}</h1>
			</div>

			{/* Search */}
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeatureAdmin refreshFunction={tagSearchTerm} />
			</div>

			<Table columns={columns} dataSource={Products} />
		</div>	
	)
}

export default ProductListAdminPage;