import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Table } from 'antd';
import { SALE_SERVER, PRODUCT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { SaleType, MAIN_CATEGORY } from '../../utils/Const.js'
import { LanguageContext } from '../../context/LanguageContext.js';
// CORS 대책
axios.defaults.withCredentials = true;

function SaleListPage() {
	const [Sales, setSales] = useState([]);
	const {isLanguage} = useContext(LanguageContext);
	const {t, i18n} = useTranslation();

	useEffect(() => {
		// 다국어 설정
    i18n.changeLanguage(isLanguage);
		// 세일정보 취득	
		getSales();
	}, [])

	// 세일정보 취득
	const getSales = async () => {
		let data = [];
    let count = 0;
		
		try {
			const result = await axios.get(`${SALE_SERVER}/list`);

			if (result.data.success)  {
				for (let i=0; i<result.data.saleInfos.length; i++) {
					count++;

					const saleInfos = result.data.saleInfos;
					
					// 세일유형 데이터 변경
					for (let j=0; j<SaleType.length; j++) {
						if (saleInfos[i].type === SaleType[j].key) {
							saleInfos[i].type = SaleType[j].value;
						}
					}
					// 세일적용 상품 카테고리 데이터 변경
					for (let j=0; j<MAIN_CATEGORY.length; j++) {
						if (saleInfos[i].item === MAIN_CATEGORY[j].key) {
							saleInfos[i].item = MAIN_CATEGORY[j].value;
						}
					}

					// 세일타입에의한 값의 기호변경
					let sign = "";
					if (saleInfos[i].type === SaleType[0].value) sign = "(%)";
					if (saleInfos[i].type === SaleType[1].value) sign = "(P)";
					if (saleInfos[i].type === SaleType[2].value) sign = "(JPY)";
					// 세일타입의 값
					if (saleInfos[i].amount !== "") {
						saleInfos[i].amount = Number(saleInfos[i].amount).toLocaleString() + sign;
					} else {
						saleInfos[i].amount = '-';
					}
					// 유효기간 시작일 변경
					let validFrom = saleInfos[i].validFrom;
					saleInfos[i].validFrom = validFrom.substring(0, 10);

					// 유효기간 종료일 변경
					let validTo = saleInfos[i].validTo;
					saleInfos[i].validTo = validTo.substring(0, 10);

					// 상품아이디를 상품명으로 변경
					if (saleInfos[i].productId && saleInfos[i].productId !== "") {
						const productInfo = await getProduct(saleInfos[i].productId);
						saleInfos[i].productId = productInfo;
					} else {
						saleInfos[i].productId = '-';
					}
					// 세일대상 정보를 true/false 로 변경
					if (saleInfos[i].except) {
						saleInfos[i].except = 'true';
					} else {
						saleInfos[i].except = 'false';
					}
					// 세일정보 활성 비활성 데이터 변경
					if (saleInfos[i].active === "1") {
						saleInfos[i].active = "active";
					} else {
						saleInfos[i].active = "inactive";
					}
					
					// key 추가
          saleInfos[i].key = count;
					data.push(saleInfos[i]);
				}
				
				setSales([...data]);
			}
		} catch (err) {
			console.log("err: ",err);
		}
	}

	// 상품정보 가져오기
  const getProduct = async(productId) => {
    try {
      const result = await axios.get(`${PRODUCT_SERVER}/coupon/products_by_id?id=${productId}`);
      if (result.data.success) {
        return result.data.productInfo[0].title;
      }
    } catch (err) {
      alert("Failed to get product information")
      console.log("err: ",err);
    }
  }

	const columns = [
		{
      title: t('Sale.code'),
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: t('Sale.type'),
      dataIndex: 'type',
      key: 'type'
    },
		{
      title: t('Sale.item'),
      dataIndex: 'item',
      key: 'item'
    },
    {
      title: t('Sale.amount'),
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: t('Sale.validFrom'),
      dataIndex: 'validFrom',
      key: 'validFrom',
    },
    {
      title: t('Sale.validTo'),
      dataIndex: 'validTo',
      key: 'validTo',
    },
		{
      title: t('Sale.product'),
      dataIndex: 'productId',
      key: 'productId',
    },
		{
      title: t('Sale.saleExcept'),
      dataIndex: 'except',
      key: 'except',
    },
		{
      title: t('Sale.active'),
      dataIndex: 'active',
      key: 'active',
    },
		{
			title: t('Sale.action'),
			key: 'action',
			render: (_, record) => (
				<>
					<a href={`/sale/update/${record._id}`}>edit</a>&nbsp;&nbsp;
				</>
			),
		},
  ];

	return (
		<div style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center', paddingTop: '38px' }}>
				<h1>{t('Sale.listTitle')}</h1>
			</div>

			<Table columns={columns} dataSource={Sales} />
		</div>	
	)
}

export default SaleListPage;