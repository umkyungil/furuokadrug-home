import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Table } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { COUPON_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { CouponType, CouponActive, MAIN_CATEGORY, UseWithSale } from '../../utils/Const.js'
import { LanguageContext } from '../../context/LanguageContext';

// CORS 대책
axios.defaults.withCredentials = true;

function CouponListPage() {
	const [Coupons, setCoupons] = useState([]);
	const { isLanguage, setIsLanguage } = useContext(LanguageContext);
	const {t, i18n} = useTranslation();

	useEffect(() => {
    i18n.changeLanguage(isLanguage);
		// 사용자정보 취득	
		getCoupons();
	}, [])

	const columns = [
		{
      title: t('Coupon.code'),
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: t('Coupon.type'),
      dataIndex: 'type',
      key: 'type'
    },
		{
      title: t('Coupon.item'),
      dataIndex: 'item',
      key: 'item'
    },
    {
      title: t('Coupon.amount'),
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: t('Coupon.active'),
      dataIndex: 'active',
      key: 'active',
    },
    {
      title: t('Coupon.validFrom'),
      dataIndex: 'validFrom',
      key: 'validFrom',
    },
    {
      title: t('Coupon.validTo'),
      dataIndex: 'validTo',
      key: 'validTo',
    },
		{
      title: t('Coupon.count'),
      dataIndex: 'count',
      key: 'count',
    },
		{
      title: t('Coupon.useWithSale'),
      dataIndex: 'useWithSale',
      key: 'useWithSale',
    },
		{
			title: t('Coupon.action'),
			key: 'action',
			render: (_, record) => (
				<>
					<a href={`/coupon/update/${record._id}`}>edit</a>&nbsp;&nbsp;
				</>
			),
		},
  ];

	// 쿠폰정보 취득
	const getCoupons = async () => {
		let data = [];
    let count = 0;
		
		try {
			const result = await axios.post(`${COUPON_SERVER}/list`);

			if (result.data.success)  {
				for (let i=0; i<result.data.couponInfos.length; i++) {
					count++;

					// 유효기간 시작일 변경
					let validFrom = result.data.couponInfos[i].validFrom;
					result.data.couponInfos[i].validFrom = validFrom.substring(0, 10);
					// 유효기간 종료일 변경
					let validTo = result.data.couponInfos[i].validTo;
					result.data.couponInfos[i].validTo = validTo.substring(0, 10);
					// 세일과 같이 사용여부
					for (let j=0; j<UseWithSale.length; j++) {
						if (result.data.couponInfos[i].useWithSale === UseWithSale[j].key) {
							result.data.couponInfos[i].useWithSale = UseWithSale[j].value;
						}
					}
					// 쿠폰유형 데이터 변경
					for (let j=0; j<CouponType.length; j++) {
						if (result.data.couponInfos[i].type === CouponType[j].key) {
							result.data.couponInfos[i].type = CouponType[j].value;
						}
					}
					// 쿠폰 사용유무 데이터 변경
					for (let j=0; j<CouponActive.length; j++) {
						if (result.data.couponInfos[i].active === CouponActive[j].key) {
							result.data.couponInfos[i].active = CouponActive[j].value;
						}
					}
					// 쿠폰적용 상품 카테고리 데이터 변경
					for (let j=0; j<MAIN_CATEGORY.length; j++) {
						if (result.data.couponInfos[i].item === MAIN_CATEGORY[j].key) {
							result.data.couponInfos[i].item = MAIN_CATEGORY[j].value;
						}
					}
					// 쿠폰 사용횟수
					if (result.data.couponInfos[i].count === "") {
						result.data.couponInfos[i].count = "無制限"
					}
					
					// key 추가
          result.data.couponInfos[i].key = count;
					data.push(result.data.couponInfos[i]);
				}
				
				setCoupons([...data]);
			}
		} catch (err) {
			console.log("getCoupons err: ",err);
		}
	}

	return (
		<div style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center' }}>
				<h1>{t('Coupon.listTitle')}</h1>
			</div>

			<Table columns={columns} dataSource={Coupons} />
		</div>	
	)
}

export default CouponListPage