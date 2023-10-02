import React, { useEffect, useContext, useState } from 'react';
import { Button, Descriptions, Tooltip } from 'antd';
import { useDispatch } from 'react-redux';
import { deleteUser } from '../../../../_actions/user_actions';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NOTHING, ENGLISH, JAPANESE, CHINESE, I18N_ENGLISH, I18N_CHINESE, I18N_JAPANESE } from '../../../utils/Const';
import { USER_SERVER } from '../../../Config';
import { LanguageContext } from '../../../context/LanguageContext';
import '../../ProductPage/Sections/product.css';
import { getLanguage, setHtmlLangProps } from '../../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function UserInfo(props) {
  const [User, setUser] = useState({});
  const history = useHistory();
  const dispatch = useDispatch();
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  let address1 = "";
  let address2 = "";
  let address3 = "";

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
    // 사용자정보 가져오기
    const userInfo = await getUserInfo(props.userId);

    // 주소값1 변경
    if (userInfo.address1) {
      address1 = userInfo.address1;
      if (address1.length > 21) {
        address1 = address1.slice(0, 21)
        address1 = address1 + "...";
      }
    }
    // 주소값2 변경
    if (userInfo.address2) {
      address2 = userInfo.address2;
      if (address2.length > 21) {
        address2 = address2.slice(0, 21)
        address2 = address2 + "...";
      }
    }
    // 주소값3 변경
    if (userInfo.address3) {
      address3 = userInfo.address3;
      if (address3.length > 21) {
        address3 = address3.slice(0, 21);
        address3 = address3 + "...";
      }
    }
    // 권한값 변경
    if (userInfo.role === 0) userInfo.role = "一般ユーザー";
    if (userInfo.role === 1) userInfo.role = "スタッフ";
    if (userInfo.role === 2) userInfo.role = "管理者";
    // 언어값 변경
    if (userInfo.language === I18N_ENGLISH) userInfo.language = ENGLISH;
    if (userInfo.language === I18N_CHINESE) userInfo.language = CHINESE;
    if (userInfo.language === I18N_JAPANESE) userInfo.language = JAPANESE;

    // 최근 로그인날짜 변형(date 추가)
    if (userInfo.lastLogin) {
      let tmpDate = new Date(userInfo.lastLogin);
      let lastLoginDate = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
      userInfo.lastLogin = lastLoginDate.replace('T', ' ').substring(0, 19) + ' (JST)';
    } else {
      userInfo.lastLogin = NOTHING;
    }
    // 삭제날짜 변형(delDate 추가)
    if (userInfo.deletedAt) {
      let tmpDate = new Date(userInfo.deletedAt);
      let deletedDate = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
      userInfo.deletedAt = deletedDate.replace('T', ' ').substring(0, 19) + ' (JST)';
    } else {
      userInfo.deletedAt = NOTHING;
    }

    setUser(userInfo);
  }
  
  // 사용자 정보 삭제
  const handleDelete = () => {
    dispatch(deleteUser(User._id))
      .then(response => {
        if (response.payload.success) {
          history.push("/user/list");
        } else {
          alert("Failed to delete user information.")
        }
      }
    )
  }

  // 사용자 정보 가져오기
  const getUserInfo = async (userId) => {
    try {
      const userInfo = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}&type=single`);

      if (userInfo.data.success) {
        return userInfo.data.user[0];
      }
    } catch (err) {
      console.log("err: ",err);
    }
  }
  
  const handleList = () => {
    history.push("/user/list");
  }
  
  return (
    <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} >
      <Descriptions>
        <Descriptions.Item label={t('User.lastName')}>{User.lastName}</Descriptions.Item>
        <Descriptions.Item label={t('User.name')}>{User.name}</Descriptions.Item>
        <Descriptions.Item label={t('User.birth')}>{User.birthday}</Descriptions.Item>
        <Descriptions.Item label={t('User.tel')}>{User.tel}</Descriptions.Item>
        <Descriptions.Item label={t('User.email')}>{User.email}</Descriptions.Item>
        <Descriptions.Item label={t('User.role')}>{User.role}</Descriptions.Item>
        <Descriptions.Item label={t('User.point')}>{User.myPoint}</Descriptions.Item>
        <Descriptions.Item label={t('User.address1')}><Tooltip title={User.address1}>{address1}</Tooltip></Descriptions.Item>
        <Descriptions.Item label={t('User.zip1')}>{User.zip1}</Descriptions.Item>
        <Descriptions.Item label={t('User.receiver1')}>{User.receiver1}</Descriptions.Item>
        <Descriptions.Item label={t('User.tel1')}>{User.tel1}</Descriptions.Item>
        <Descriptions.Item label={t('User.address2')}><Tooltip title={User.address2}>{address2}</Tooltip></Descriptions.Item> 
        <Descriptions.Item label={t('User.zip2')}>{User.zip2}</Descriptions.Item>
        <Descriptions.Item label={t('User.receiver2')}>{User.receiver2}</Descriptions.Item>
        <Descriptions.Item label={t('User.tel2')}>{User.tel2}</Descriptions.Item>
        <Descriptions.Item label={t('User.address3')}><Tooltip title={User.address3}>{address3}</Tooltip></Descriptions.Item>
        <Descriptions.Item label={t('User.zip3')}>{User.zip3}</Descriptions.Item>
        <Descriptions.Item label={t('User.receiver3')}>{User.receiver3}</Descriptions.Item>
        <Descriptions.Item label={t('User.tel3')}>{User.tel3}</Descriptions.Item>
        <Descriptions.Item label={t('User.language')}>{User.language}</Descriptions.Item>
        <Descriptions.Item label={t('User.lastLogin')}>{User.lastLogin}</Descriptions.Item>
        <Descriptions.Item label={t('User.deletedAt')}>{User.deletedAt}</Descriptions.Item>
      </Descriptions>

      <br />
      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'center' }} >
        <Button onClick={handleList}>
          User List
        </Button>
        &nbsp;&nbsp;&nbsp;
        <Button type="danger" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  )
}

export default UserInfo;