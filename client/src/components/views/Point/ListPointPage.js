import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Input, Form, Button  } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { POINT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
// CORS 대책
axios.defaults.withCredentials = true;

function ListPointPage(props) {
	const [Points, setPoints] = useState(0);
	const [TotalPoint, setTotalPoint] = useState([]);
	const [UserId, setUserId] = useState("");
	const [ShowButton, setShowButton] = useState(true);
	const {t, i18n} = useTranslation();
	const history = useHistory();

	useEffect(() => {
		// 다국어 설정
		i18n.changeLanguage(localStorage.getItem("i18nextLng"));

		let userId = props.match.params.userId;
		if (!userId) {
			userId = localStorage.getItem("userId")
			setShowButton(false);
		} else {
			setShowButton(true);
		}
		
		setUserId(userId);

		// 포인트 정보 가져오기
		let body = { 
			userId: userId,
			searchTerm: []
		}
		
		getPointInfo(body);
	}, [])
	
	// 포인트 정보 검색
	const updateSearchTerm = (newSearchTerm) => {
		let body = { 
			userId: UserId,
			searchTerm: newSearchTerm
		}

		getPointInfo(body);
	}

	// 포인트 정보 가져오기
	const getPointInfo = async (body) => {
		let data = [];
    let count = 0;
		let totalPoint = 0;

    try {
      const result = await axios.post(`${POINT_SERVER}/list`, body);
      if (result.data.success) {
				let tmpPointInfo = {};

				for (let i=0; i<result.data.pointInfos.length; i++) {
					count++;
					tmpPointInfo = result.data.pointInfos[i];

					// 남은 포인트가 0인 경우 유효기간을 [-]로 처리한다
					const remainingPoints = Number(tmpPointInfo.remainingPoints)
					totalPoint += remainingPoints; // 포인트 누적
					console.log("remainingPoints: ", remainingPoints);
					if (remainingPoints === 0) {
						tmpPointInfo.validTo = "-";
					}
					// subSeq > 0 는 복사된 레코드이기에 포인트 및 포인트 획득일을 [-]로 처리한다
					const subSeq = Number(tmpPointInfo.subSeq);
					if (subSeq > 0) {
						tmpPointInfo.point = "-";
						tmpPointInfo.validFrom = "-";
					}
					// key 추가
					if (count !== 0) {
						tmpPointInfo.key = count;
						data.push(tmpPointInfo);
					}
				}
				// 포인트 저장
				setPoints([...data]);
				setTotalPoint(totalPoint)

      } else {
        alert("Failed to get user information.")
      }      
    } catch (err) {
      console.log("ListPointPage err: ",err);
			alert("Failed to get user information.")
    }
  }

	// 랜딩페이지 이동
  const listHandler = () => {
    history.push("/user/list");
  }

	const pointColumns = [
		// 포인트
    {
      title: t('Point.point'),
      dataIndex: 'point',
      key: 'point',
    },
		// 포인트 취득일
		{
      title: t('Point.validFrom'),
      dataIndex: 'validFrom',
      key: 'validFrom',
    },
		// 사용한 포인트
		{
      title: t('Point.dspUsePoint'),
      dataIndex: 'dspUsePoint',
      key: 'dspUsePoint',
    },
		// 사용일
		{
      title: t('Point.dateUsed'),
      dataIndex: 'dateUsed',
      key: 'dateUsed',
    },
		// 유효기간
		{
      title: t('Point.validTo'),
      dataIndex: 'validTo',
      key: 'validTo',
    },
		// 남은 포인트
		{
      title: t('Point.remainingPoints'),
      dataIndex: 'remainingPoints',
      key: 'remainingPoints',
    },
  ];

	return (
		<div style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center' }}>
				<h1>{t('Point.listTitle')}</h1>	
			</div>

			{/* Filter */}
			{/* Search */}
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<Form name="basic" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} autoComplete="off">
					<Form.Item label={t('Point.totalPoints')} name="point" rules={[{ required: false, message: 'Total point' }]}>
						<Input value={TotalPoint} readOnly/>
					</Form.Item>
					{/* <SearchFeature refreshFunction={updateSearchTerm}/> */}
				</Form>
			</div>

			<Table columns={pointColumns} dataSource={Points} />
			<br/>
			<br/>
			{ShowButton && 
				<div style={{ display: 'flex', justifyContent: 'center' }} >
					<Button size="large" onClick={listHandler}>
						Landing Page
					</Button>
				</div>
			}
		</div>	
	)
}

export default ListPointPage