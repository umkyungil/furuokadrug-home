import React, { useEffect, useContext } from 'react';
import { Button, Descriptions, Tooltip } from 'antd';
import { useDispatch } from 'react-redux';
import { deleteUser } from '../../../../_actions/user_actions';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NOTHING, ENGLISH, JAPANESE, CHINESE, I18N_ENGLISH, I18N_CHINESE, I18N_JAPANESE } from '../../../utils/Const';
import { LanguageContext } from '../../../context/LanguageContext';

function UserInfo(props) {
  const history = useHistory();
  const dispatch = useDispatch();
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
		// 다국어 설정
    i18n.changeLanguage(isLanguage);
	}, [])

  let address1 = "";
  let address2 = "";
  let address3 = "";
  let role = "";
  let language = "";
  let point = "";
  let lastDate = "";
  let delDate = "";

  // 주소값1 변경
  if (props.detail.address1) {
    address1 = props.detail.address1;
    if (address1.length > 21) {
      address1 = address1.slice(0, 21)
      address1 = address1 + "...";
    }
  }
  // 주소값2 변경
  if (props.detail.address2) {
    address2 = props.detail.address2;
    if (props.detail.address2.length > 21) {
      address2 = address2.slice(0, 21)
      address2 = address2 + "...";
    }
  }
  // 주소값3 변경
  if (props.detail.address3) {
    address3 = props.detail.address3;
    if (props.detail.address3.length > 21) {
      address3 = address3.slice(0, 21);
      address3 = address3 + "...";
    }
  }
  // 권한값 변경
  if (props.detail.role === 0) role = "一般ユーザー";
  if (props.detail.role === 1) role = "スタッフ";
  if (props.detail.role === 2) role = "管理者";
  // 언어값 변경
  if (props.detail.language === I18N_ENGLISH) language = ENGLISH;
  if (props.detail.language === I18N_CHINESE) language = CHINESE;
  if (props.detail.language === I18N_JAPANESE) language = JAPANESE;
  // 포인트 변경
  if (!props.detail.point || props.detail.point === "") point = "0";
  // 최근 로그인날짜 변형(date 추가)
  if (props.detail.lastLogin) {
    let tmpDate = new Date(props.detail.lastLogin);
    let lastLoginDate = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
    lastDate = lastLoginDate.replace('T', ' ').substring(0, 19) + ' (JST)';
  } else {
    lastDate = NOTHING;
  }
  // 삭제날짜 변형(delDate 추가)
  if (props.detail.deletedAt) {
    let tmpDate = new Date(props.detail.deletedAt);
    let deletedDate = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
    delDate = deletedDate.replace('T', ' ').substring(0, 19) + ' (JST)';
  } else {
    delDate = NOTHING;
  }
  
  // 사용자 정보 삭제
  const deleteHandler = () => {
    dispatch(deleteUser(props.detail._id))
      .then(response => {
        if (response.payload.success) {
          history.push("/user/list");
        } else {
          alert("Failed to delete user information.")
        }
      }
    )
  }
  
  const listHandler = () => {
    history.push("/user/list");
  }
  
  return (
    <div>
      <Descriptions>
        <Descriptions.Item label={t('User.lastName')}>{props.detail.lastName}</Descriptions.Item>
        <Descriptions.Item label={t('User.name')}>{props.detail.name}</Descriptions.Item>
        <Descriptions.Item label={t('User.birth')}>{props.detail.birthday}</Descriptions.Item>
        <Descriptions.Item label={t('User.tel')}>{props.detail.tel}</Descriptions.Item>
        <Descriptions.Item label={t('User.email')}>{props.detail.email}</Descriptions.Item>
        <Descriptions.Item label={t('User.role')}>{role}</Descriptions.Item>
        <Descriptions.Item label={t('User.point')}>{point}</Descriptions.Item>
        <Descriptions.Item label={t('User.address1')}><Tooltip title={props.detail.address1}>{address1}</Tooltip></Descriptions.Item>
        <Descriptions.Item label={t('User.receiver1')}>{props.detail.receiver1}</Descriptions.Item>
        <Descriptions.Item label={t('User.tel1')}>{props.detail.tel1}</Descriptions.Item>
        <Descriptions.Item label={t('User.address2')}><Tooltip title={props.detail.address2}>{address2}</Tooltip></Descriptions.Item> 
        <Descriptions.Item label={t('User.receiver2')}>{props.detail.receiver2}</Descriptions.Item>
        <Descriptions.Item label={t('User.tel2')}>{props.detail.tel2}</Descriptions.Item>
        <Descriptions.Item label={t('User.address3')}><Tooltip title={props.detail.address3}>{address3}</Tooltip></Descriptions.Item>
        <Descriptions.Item label={t('User.receiver3')}>{props.detail.receiver3}</Descriptions.Item>
        <Descriptions.Item label={t('User.tel3')}>{props.detail.tel3}</Descriptions.Item>
        <Descriptions.Item label={t('User.language')}>{language}</Descriptions.Item>
        <Descriptions.Item label={t('User.lastLogin')}>{lastDate}</Descriptions.Item>
        <Descriptions.Item label={t('User.deletedAt')}>{delDate}</Descriptions.Item>
      </Descriptions>

      <br />
      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'center' }} >
        <Button size="large" onClick={listHandler}>
          User List
        </Button>
        &nbsp;&nbsp;&nbsp;
        <Button size="large" type="danger" onClick={deleteHandler}>
          Delete
        </Button>
      </div>
    </div>
  )
}

export default UserInfo