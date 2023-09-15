import React, { useEffect, useState, useContext } from 'react';
import { Table } from 'antd';
import { IMAGES_SERVER } from '../../Config.js';
import { IMAGES_VISIBLE_ITEM, IMAGES_LANGUAGE, IMAGES_TYPE } from '../../utils/Const';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import '../ProductPage/Sections/product.css';
import { getLanguage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function ImagesListPage() {
	const [Images, setImages] = useState([]);
	const {isLanguage, setIsLanguage} = useContext(LanguageContext);
	const {t, i18n} = useTranslation();

	useEffect(() => {
		// 다국어 설정
    i18n.changeLanguage(isLanguage);
		// 이미지정보 가져오기
		getImages();
	}, [])

	// 이미지정보 가져오기
	const getImages = async () => {
		let data = [];

		try {
			const images = await axios.get(`${IMAGES_SERVER}/list`);
			
			let imageInfos = images.data.imageInfos;
			for (let i = 0; i < imageInfos.length; i++) {
				// 이미지 타입변환
				for (let j = 0; j < IMAGES_TYPE.length; j++) {
					if (imageInfos[i].type === IMAGES_TYPE[j]._id) {
						imageInfos[i].type = IMAGES_TYPE[j].name;
					}
				}
				// 화면표시여부 변환
				for (let j = 0; j < IMAGES_VISIBLE_ITEM.length; j++) {
					if (imageInfos[i].visible === IMAGES_VISIBLE_ITEM[j]._id) {
						imageInfos[i].visible = IMAGES_VISIBLE_ITEM[j].name;
					}
				}
				// 언어코드 변환
				for (let j = 0; j < IMAGES_LANGUAGE.length; j++) {
					if (imageInfos[i].language === IMAGES_LANGUAGE[j]._id) {
						imageInfos[i].language = IMAGES_LANGUAGE[j].name;
					}
				}
				// 이미지 주소 문자열 자르기
				imageInfos[i].image = imageInfos[i].image.substring(59);
				// 생성일 utc -> jp 변환 
				imageInfos[i].createdAt = getLocalTime(imageInfos[i].createdAt);

				// key 추가
				imageInfos[i].key = i;
				data.push(imageInfos[i]);
			}
			
			setImages([...data]);
			
		} catch (err) {
			console.log("err: ",err);
		}
	}

	const getLocalTime = (utcTime) => {
    let localTime = moment.utc(utcTime).toDate();
    localTime = moment(localTime).format('YYYY-MM-DD HH:mm');
    return localTime;
  }

	const columns = [
		{
      title: t('Images.types'),
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: t('Images.image'),
      dataIndex: 'image',
      key: 'image'
    },
		{
      title: t('Images.language'),
      dataIndex: 'language',
      key: 'language'
    },
		{
      title: t('Images.description'),
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: t('Images.visible'),
      dataIndex: 'visible',
      key: 'visible',
    },
    {
      title: t('Images.createdDate'),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
		{
			title: t('Images.action'),
			key: 'action',
			render: (_, record) => (
				<>
					<a href={`/images/update/${record._id}`}>edit</a>
				</>
			),
		},
  ];

	return (
		<div style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center', paddingTop: '38px' }}>
				<h1>{t('Images.listTitle')}</h1>
			</div>
			<Table columns={columns} dataSource={Images} />
		</div>	
	)
}

export default ImagesListPage;