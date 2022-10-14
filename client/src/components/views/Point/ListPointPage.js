import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Input, Form, Button  } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { POINT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { EXPIRED_CN, EXPIRED_JP, EXPIRED_EN } from '../../utils/Const'
// CORS 대책
axios.defaults.withCredentials = true;

function ListPointPage(props) {
	const [Points, setPoints] = useState([]);
	const [TotalPoint, setTotalPoint] = useState([]);
	const [UserId, setUserId] = useState("");
	const [InvalidData, setInvalidData] = useState([]);
	const [ShowButton, setShowButton] = useState(true);
	const {t, i18n} = useTranslation();
	const history = useHistory();

	useEffect(() => {
		// 다국어 설정
		i18n.changeLanguage(localStorage.getItem("i18nextLng"));

		let userId = props.match.params.userId; // 관리자에서 들어올 경우
		if (!userId) {
			userId = localStorage.getItem("userId"); // 사용자에서 들어올 경우
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
	}, [localStorage.getItem("i18nextLng")])
	
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

				let dt1 = new Date();
				let currentDate = new Date(dt1.getTime() - (dt1.getTimezoneOffset() * 60000)).toISOString();
				let current = new Date(currentDate.substring(0, 10));
				let pointInfos = result.data.pointInfos;
				let invalidData = []
        
				// 유효기간내의 총 사용가능한 포인트를 계산
				for (let i=0; i<pointInfos.length; i++) {
						let from = pointInfos[i].validFrom;
						let to = pointInfos[i].validTo;
						let validFrom = new Date(from.substring(0, 10));
						let validTo = new Date(to.substring(0, 10));

						if ((validFrom <= current) && (current <= validTo)) {
							// 포인트 누적
							const remainingPoints = Number(pointInfos[i].remainingPoints)
							totalPoint += remainingPoints;
						} else {
							setInvalidData([...InvalidData, pointInfos[i]._id])
							invalidData.push(pointInfos[i]._id)
						}
				}

				for (let i=0; i<pointInfos.length; i++) {
					count++;

					tmpPointInfo = pointInfos[i];
					const remainingPoints = Number(tmpPointInfo.remainingPoints)

					// 사용한 날짜 변경
					if (tmpPointInfo.dateUsed) {
						let dateUsed = tmpPointInfo.dateUsed;
						tmpPointInfo.dateUsed = dateUsed.substring(0, 10);
					} else {
						tmpPointInfo.dateUsed = "-";
					}

					// 유효기간 시작일
					if (tmpPointInfo.validFrom) {
						let validFrom = tmpPointInfo.validFrom;
						tmpPointInfo.validFrom = validFrom.substring(0, 10);
					}

					// 유효기간 만료일
					if (tmpPointInfo.validTo) {
						let validTo = tmpPointInfo.validTo;
						tmpPointInfo.validTo = validTo.substring(0, 10);
					}

					// 남은 포인트가 0인경우 유효기간을 [-]로 처리한다
					if (remainingPoints === 0) {
						tmpPointInfo.validTo = "-";
					}

					// 유효기간이 지난 포인트의 데이터 변경
					if (invalidData.length > 0) {
						for (let i=0; i<invalidData.length; i++) {
							if (tmpPointInfo._id === invalidData[i]) {
								if (localStorage.getItem("i18nextLng") === "jp") tmpPointInfo.remainingPoints = EXPIRED_JP;
								if (localStorage.getItem("i18nextLng") === "en") tmpPointInfo.remainingPoints = EXPIRED_EN;
								if (localStorage.getItem("i18nextLng") === "cn") tmpPointInfo.remainingPoints = EXPIRED_CN;
							}
						}
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
      }     
    } catch (err) {
      console.log("ListPointPage err: ",err);
			alert("Failed to get user information.")
    }
  }

	// 랜딩페이지 이동
  const listHandler = () => {
    history.push("/");
  }

	const columns = [
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


			{/* <span style={{textDecoration: "line-through"}}><Table columns={columns} dataSource={Points} /></span> */}
			<Table columns={columns} dataSource={Points} />
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