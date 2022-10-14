import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from 'antd';
import { COUPON_SERVER, USER_SERVER, PRODUCT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { CouponType, CouponActive, MainCategory, UseWithSale } from '../../utils/Const.js'
// CORS 대책
axios.defaults.withCredentials = true;

function CouponHistoryListPage() {
	const [Coupons, setCoupons] = useState([]);

	useEffect(() => {
		// 다국어 설정
    setMultiLanguage(localStorage.getItem("i18nextLng"));
		// 쿠폰정보 취득	
		getHistoryCoupons();
	}, [])

	// 다국어 설정
  const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);
  }

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
      title: t('Coupon.product'),
      dataIndex: 'productId',
      key: 'productId',
    },
		{
      title: t('Coupon.user'),
      dataIndex: 'userId',
      key: 'userId',
    },
		{
      title: t('Coupon.couponUser'),
      dataIndex: 'couponUserId',
      key: 'couponUserId',
    },
  ];

	// 쿠폰정보 취득
	const getHistoryCoupons = async () => {
		let data = [];
    let count = 0;
		
		try {
			const result = await axios.get(`${COUPON_SERVER}/history/list`);
	
			if (result.data.success)  {
				for (let i=0; i<result.data.couponInfos.length; i++) {
					count++;

					let history = result.data.couponInfos[i];
					
					// 유효기간 시작일 변경
					let validFrom = history.validFrom;
					history.validFrom = validFrom.substring(0, 10);
					// 유효기간 종료일 변경
					let validTo = history.validTo;
					history.validTo = validTo.substring(0, 10);
					// 쿠폰유형 데이터 변경
					for (let j=0; j<CouponType.length; j++) {
						if (history.type === CouponType[j].key) {
							history.type = CouponType[j].value;
						}
					}
					// 쿠폰 사용유무 데이터 변경
					for (let j=0; j<CouponActive.length; j++) {
						if (history.active === CouponActive[j].key) {
							history.active = CouponActive[j].value;
						}
					}
					// 쿠폰적용 상품 카테고리 데이터 변경
					for (let j=0; j<MainCategory.length; j++) {
						if (history.item === MainCategory[j].key) {
							history.item = MainCategory[j].value;
						}
					}
					// 세일과 같이 사용여부
					for (let j=0; j<UseWithSale.length; j++) {
						if (history.useWithSale === UseWithSale[j].key) {
							history.useWithSale = UseWithSale[j].value;
						}
					}
					// 쿠폰 사용횟수
					if (history.count === "") {
						history.count = "無制限"
					}
					// 쿠폰 지정 사용자
					if (history.userId === "") {
						history.userId = "-"
					} else {
						const result = await axios.get(`${USER_SERVER}/users_by_id?id=${history.userId}`);
						if (result.data.success) {
							history.userId = result.data.user[0].lastName;
						}
					}
					// 쿠폰 지정 상품
					if (history.productId === "") {
						history.productId = "-"
					} else {
						const result = await axios.get(`${PRODUCT_SERVER}/coupon/products_by_id?id=${history.productId}`);
						if (result.data.success) {
							history.productId = result.data.productInfo[0].title;
						}
					}
					// 쿠폰 지정 사용자
					if (history.couponUserId === "") {
						history.couponUserId = "-"
					} else {
						const result = await axios.get(`${USER_SERVER}/users_by_id?id=${history.couponUserId}`);
						if (result.data.success) {
							history.couponUserId = result.data.user[0].lastName;
						}
					}
					// key 추가
          history.key = count;
					data.push(history);
				}
				
				setCoupons([...data]);
			}
		} catch (err) {
			console.log("getHistoryCoupons err: ",err);
		}
	}

	return (
		<div style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center' }}>
				<h1>{t('Coupon.historyTitle')}</h1>
			</div>

			<Table columns={columns} dataSource={Coupons} />
		</div>	
	)
}

export default CouponHistoryListPage