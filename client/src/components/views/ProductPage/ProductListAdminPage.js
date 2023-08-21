import React, { useEffect, useState, useContext } from 'react';
import { Table } from 'antd';
import { PRODUCT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { MAIN_CATEGORY, PRODUCT_VISIBLE_TYPE } from '../../utils/Const.js'
import { LanguageContext } from '../../context/LanguageContext.js';
import axios from 'axios';
import { getLocalTime } from '../../utils/CommonFunction.js';
// CORS 대책
axios.defaults.withCredentials = true;

function ProductListAdminPage() {
	const [Products, setProducts] = useState([]);
	const {isLanguage} = useContext(LanguageContext);
	const {t, i18n} = useTranslation();

	useEffect(() => {
		// 다국어 설정
    i18n.changeLanguage(isLanguage);
		process();
	}, [])

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

	return (
		<div style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center', paddingTop: '38px' }}>
				<h1>{t('Product.listAdminTitle')}</h1>
			</div>

			<Table columns={columns} dataSource={Products} />
		</div>	
	)
}

export default ProductListAdminPage;