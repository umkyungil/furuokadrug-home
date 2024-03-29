import React, { useEffect, useState, useContext } from 'react';
import { Table, Radio } from 'antd';
import { PRODUCT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { MAIN_CATEGORY, PRODUCT_VISIBLE_TYPE } from '../../utils/Const.js'
import SearchFeature from './Section/SearchFeature.js';

import { LanguageContext } from '../../context/LanguageContext.js';
import { getLocalTime, getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function InventoryListPage() {
	const [Products, setProducts] = useState([]);
	const {isLanguage, setIsLanguage} = useContext(LanguageContext);
	const {t, i18n} = useTranslation();
	const history = useHistory();

	useEffect(() => {
		// 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);

		// 상품정보 가져오기
		getProducts({ searchTerm: ["0", "0", "9999", ""] });
	}, [isLanguage])

	// 상품정보 가져오기
	const getProducts = async (body) => {
		let data = [];
    let count = 0;
		
		try {
			const result = await axios.post(`${PRODUCT_SERVER}/inventory/list`, body);

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

					// 금액 콤마표기
					productInfos[i].price = productInfos[i].price.toLocaleString();
					// 수량 콤마표기
					productInfos[i].quantity = productInfos[i].quantity.toLocaleString();
					// 최대 구매수량 콤마표기
					productInfos[i].maxQuantity = productInfos[i].maxQuantity.toLocaleString();
					
					// 재고관리 대상인지 대상외인지 구분
					// false: 재고관리 대상, true: 재고관리 제외
					if (productInfos[i].inventoryExcept) {
						productInfos[i].inventoryExcept = "Except";
					} else {
						productInfos[i].inventoryExcept = "Stock";
					}
					// 상품등록일 로컬일자로 변경
					productInfos[i].createdAt = getLocalTime(productInfos[i].createdAt);
					
					// key 추가
          productInfos[i].key = count;
					data.push(productInfos[i]);
				}
				
				setProducts([...data]);
			}
		} catch (err) {
			console.log("InventoryListPage getProducts err: ",err);
			alert(getMessage(getLanguage(), 'key001'));
			listHandler();
		}
	}

	// 코드일람 페이지 이동
  const listHandler = () => {
    history.push('/');
  }

	const handleClick = async (id, e) => {
		// 재고수량
		if (e.target.value === 'quantity') {
			const quantity = window.prompt("Please enter the stock quantity");
			
			if (quantity) {
				// 숫자 체크
				if (isNaN(quantity)) {
					alert(getMessage(getLanguage(), 'key080'));
					return;
				}
				
				const result = await axios.post(`${PRODUCT_SERVER}/inventory/update`, {_id: id, type: 'quantity', quantity: quantity});
				if (result.data.success) {
					getProducts({ searchTerm: ["0", "0", "9999", ""] });
				} else {
					alert(getMessage(getLanguage(), 'key081'));
					return;
				}
			}
		}
		// 최대 구매수량
		if (e.target.value === 'maxQuantity') {
			const maxQuantity = window.prompt("Please enter the maximum purchase quantity");

			if (maxQuantity) {
				// 숫자 체크
				if (isNaN(maxQuantity)) {
					alert(getMessage(getLanguage(), 'key080'));
					return;
				}
	
				const result = await axios.post(`${PRODUCT_SERVER}/inventory/update`, {_id: id, type: 'maxQuantity', maxQuantity: maxQuantity});
				if (result.data.success) {
					getProducts({ searchTerm: ["0", "0", "9999", ""] });
				} else {
					if (result.data.message === "except") {
						alert(getMessage(getLanguage(), 'key081'));
					} else if (result.data.message === "quantity") {
						alert(getMessage(getLanguage(), 'key082'));
					}
					return;
				}
			}
		}
		// 재고관리 제외상품
		if (e.target.value === 'except') {
			const except = window.confirm("Don't you do inventory management?");

			if (except) {
				const result = await axios.post(`${PRODUCT_SERVER}/inventory/update`, {_id: id, type: 'except'});
				if (result.data.success) {
					getProducts({ searchTerm: ["0", "0", "9999", ""] });
				}
			}
		}
		// 재고관리 대상상품
		if (e.target.value === 'include') {
			const include = window.confirm("Do you want to manage inventory?");

			if (include) {
				const result = await axios.post(`${PRODUCT_SERVER}/inventory/update`, {_id: id, type: 'include'});
				if (result.data.success) {
					getProducts({ searchTerm: ["0", "0", "9999", ""] });
				}
			}
		}	
  }	

	// 상품정보 검색
	const searchTerm = (newSearchTerm) => {
		getProducts({ searchTerm: newSearchTerm });
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
      title: t('Product.category'),
      dataIndex: 'continents',
      key: 'continents'
    },
		{
      title: t('Product.quantity'),
      dataIndex: 'quantity',
      key: 'quantity'
    },
		{
      title: t('Product.maxQuantity'),
      dataIndex: 'maxQuantity',
      key: 'maxQuantity'
    },
		{
      title: t('Product.inventoryExcept'),
      dataIndex: 'inventoryExcept',
      key: 'inventoryExcept'
    },
		{
			title: 'Action',
			key: 'update',
			render: (_, record) => (
				<>					
					<Radio.Group onChange={(e) => {handleClick(record._id, e)}}>
						<Radio.Button style={{height:'30px'}} value="quantity">Qty</Radio.Button>
						<Radio.Button style={{height:'30px', color:'white', backgroundColor:'#3385ff'}} value="maxQuantity">Max Qty</Radio.Button>
						<Radio.Button style={{height:'30px', color:'white', backgroundColor:'#8dcd52'}} value="include">Include</Radio.Button>
						<Radio.Button style={{height:'30px', color:'white', backgroundColor:'#ff4d4d'}} value="except">Except</Radio.Button>
					</Radio.Group>
				</>
			),
		},		
  ];

	return (
		<div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center', paddingTop: '38px' }}>
				<h1>{'Product inventory list'}</h1>
			</div>
			{/* Search */}
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={searchTerm} />
			</div>

			<Table columns={columns} dataSource={Products} />
		</div>	
	)
}

export default InventoryListPage;