import React, { useEffect, useState, useContext } from 'react';
import { Button, Descriptions, Collapse, Tag } from 'antd';
import { useDispatch } from 'react-redux';
import { addToCart, anyRegisterUser, loginUser } from '../../../../_actions/user_actions';
import { useHistory } from 'react-router-dom';
import { PRODUCT_SERVER, USER_SERVER } from '../../../Config.js';
import { useTranslation } from 'react-i18next';
import cookie from 'react-cookies';
import { LanguageContext } from '../../../context/LanguageContext';
import { SALE_TAG, NOTICE_TAG, SOLD_OUT_TAG, PRODUCT_VISIBLE_TYPE, ANONYMOUS } from '../../../utils/Const';
import './product.css';
import { getLanguage } from '../../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

// props 상품정보
function ProductInfo(props) {
  const history = useHistory();
  const dispatch = useDispatch();
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();
  const {Panel} = Collapse;
    
  const [User, setUser] = useState({});
  const [IsRecTag, setIsRecTag] = useState(false);
  const [IsSaleTag, setIsSaleTag] = useState(false);
  const [SoldOutTag, setSoldOutTag] = useState(false);

  useEffect(() => {
    // 다국적언어 설정
    i18n.changeLanguage(isLanguage);
    
    if (props.detail) {
      process();
    }
	}, [props.detail])

  const process = async() => {
    try {
      // 사용자 정보 로컬스토리지에서 가져오기
      const userId = localStorage.getItem("userId");
      // 불특정 사용자인경우 처리예외
      if (userId) {
        // 사용자정보 가져오기
        await getUser(userId);
      }
      
      // 상품 노출정보로 상품태그 확인
      handleTag()
    } catch (err) {
      console.log("err: ",err);
    }
  } 
  // 사용자정보 가져오기
  const getUser = async (userId) => {
    try {
      const user = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);
      if (user.data.success) {
        setUser(user.data.user[0]);
      }
    } catch (err) {
      console.log("err: ",err);
    }
  }

  // 상품 노출정보및 상품재고가 없는경우 태그표시
  const handleTag = async () => {
    try {
      // 상품 노출정보 가져오기
      if (props.detail.hasOwnProperty("_id")) {
        if (props.detail.exposureType.length > 0) {
          for (let i=0; i<props.detail.exposureType.length; i++) {
            // 추천상품인지 
            if (props.detail.exposureType[i] === PRODUCT_VISIBLE_TYPE[3].key) {
              setIsRecTag((IsRecTag) => !IsRecTag);
            }
            // 세일상품인지
            if (props.detail.exposureType[i] === PRODUCT_VISIBLE_TYPE[4].key) {
              setIsSaleTag((IsSaleTag) => !IsSaleTag);
            }
          }
        }
      }      
      
      // 재고관리 대상외 상품은 구매가 언제든지 가능한 제품
      // 재고가 0인경우만 구매를 못하게 한다   
      if (props.detail.quantity === 0) {
        setSoldOutTag(true);
      } else {
        setSoldOutTag(false);
      }
    } catch (err) {
      console.log("err: ",err);
    }
  }

  // 카트 넣기
  const cartHandler = async () => {
    try {
      // 재고가 없으면 구매를 하지 못하게 한다
      if (SoldOutTag) {
        alert("This product is out of stock");
        return;
      }

      // 로그인 한 경우
      if (localStorage.getItem("userId")) {
        // 필요한 정보를 Cart필드에 넣어준다
        dispatch(addToCart(props.detail._id));
      } else {
        // 로그인하지 않은 경우
        // 세션스토리지에 사용자 아이디가 없는경우 불특정 사용자 아이디를 생성하고 카트 정보를 넣는다
        if (!sessionStorage.getItem("userId")) {
          // 불특정 사용자 이름등의 정보를 만들기 위해 불특정 사용자 갯수를 확인
          const users = await axios.post(`${USER_SERVER}/anonymous/list`, { searchTerm: ANONYMOUS });
          if (users.data.success) {
            let count = 0;
            if (users.data.userInfo.length > 0) {
              count = users.data.userInfo.length;
            }          
            count += 1;

            // 불특정 사용자수(카운트)에 따라 이메일등을 변경해서 사용자를 생성
            let regUserToSubmit = {
              name: ANONYMOUS + count,
              lastName: ANONYMOUS + count,
              birthday: "19700911",
              email: "anonymous"+count+"@hirosophy.co.jp",
              tel: "0367017003",
              password: ANONYMOUS,
              confirmPassword: '',
              address1: "東京都港区芝4-6-4 ヒロソフィー三田ビル",
              receiver1: "株式会社ヒロソフィー",
              tel1: "0367017003",
              address2: "",
              receiver2: "",
              tel2: "",
              address3: "",
              receiver3: "",
              tel3: "",
              image: "",
              language: "jp",
              deletedAt: '',
              role: "3"
            };

            // 불특정 사용자 등록
            dispatch(anyRegisterUser(regUserToSubmit)).then(async (anyRegUserInfo) => {
              if (anyRegUserInfo.payload.success) {
                // 위에서 등록한 불특정 사용자 정보 가져오기
                let value = ANONYMOUS + count;
                let body = { searchTerm: value }
                const users = await axios.post(`${USER_SERVER}/anonymous/list`, body);

                // 불특정 사용자 로그인 
                let dataToSubmit = {
                  email: users.data.userInfo[0].email,
                  password: ANONYMOUS
                };
                dispatch(loginUser(dataToSubmit))
                .then(anyLogin => {
                  if (anyLogin.payload.loginSuccess) {
                    // sessionStorage에 등록
                    sessionStorage.setItem('userId', anyLogin.payload.userInfo._id);
                    sessionStorage.setItem('userName', ANONYMOUS);

                    // 필요한 정보를 Cart필드에 넣어준다
                    dispatch(addToCart(props.detail._id));
                  }
                })
              }
            })
          }
        } else {
          // 세션스토리지에 userId가 있는 경우
          //   불특정 사용자가 상품을 추가하기 위해서 add to cart 버튼을 1회 이상 눌렀을때
          //   또는 Landing page로 이동해서 다른상품을 클릭하고 이 페이지에서 버튼을 눌렀을때
          //   페이지를 임의로 종료하거나 해서 로컬스토리지에 정보가 남아 있는데 로그인이 되지 않은 경우
          const userId = sessionStorage.getItem("userId");
          const userName = sessionStorage.getItem("userName");
          // 쿠키에 토큰정보가 없는경우
          if (!cookie.load('w_auth')) {
            // 로컬스토리지에 붙특정 사용자의 정보가 있는경우 로그인 처리
            if (userName === ANONYMOUS) {
              // 로그인해서 토큰정보를 쿠키에 저장
              const userInfo = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);
              if (userInfo.data.success) {
                let dataToSubmit = {
                  email: userInfo.data.user[0].email,
                  password: ANONYMOUS
                };

                dispatch(loginUser(dataToSubmit))
                .then(anyLogin => {
                  if (anyLogin.payload.loginSuccess) {
                    // localStorage에 등록
                    sessionStorage.setItem('userId', anyLogin.payload.userInfo._id);
                    sessionStorage.setItem('userName', ANONYMOUS);

                    // 필요한 정보를 Cart필드에 넣어준다
                    dispatch(addToCart(props.detail._id));
                  }
                })
              }
            }
          } else {
            if (userName === ANONYMOUS) {
              dispatch(addToCart(props.detail._id));
            }
          }
        }
      }
    } catch (err) {
      console.log("getUser err: ",err);
      alert("Failed to get user information");
    }
  }

  // 상품 수정
  const modifyHandler = () => {
    history.push(`/product/update/${props.detail._id}`);
  }
  // 상품 삭제
  const deleteHandler = async () => {
    const body = {
      id: props.detail._id,
      images: props.detail.images
    }

    await axios.post(`${PRODUCT_SERVER}/delete`, body)
      .then(response => {
        if (response.data.success) {
          alert('Product delete was successful.');
          listHandler();
        } else {
          alert('Product delete failed.');
        }
      });
  }
  // Landing pageへ戻る
  const listHandler = () => {
    history.push("/");
  }

  // 로그인 후
  if (User.hasOwnProperty("_id") && cookie.load('w_auth')) {
    return (
      <div>
        <Descriptions>
          <Descriptions.Item label={t('Product.price')}>{Number(props.detail.price).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label={t('Product.contents')}>{props.detail.contents}</Descriptions.Item>
          <Descriptions.Item >
            {/* 일반 사용자인 경우는 표시하지 않는다 */}
            { User.role !== 0 && 
              <>
                {t('Product.quantity')}: {props.detail.quantity}&nbsp;&nbsp;&nbsp;&nbsp;
              </>
            }
            {IsSaleTag && <Tag color="#f50">&nbsp;&nbsp;{SALE_TAG}&nbsp;&nbsp;</Tag>}
            {IsRecTag && <Tag color="#fa0">{NOTICE_TAG}</Tag>}
            {SoldOutTag && <Tag color="#0af">{SOLD_OUT_TAG}</Tag>}
          </Descriptions.Item>
        </Descriptions>

        <Collapse defaultActiveKey={['0']}>
          <Panel header={t('Product.description')}>
            <Descriptions className={isLanguage === "cn" ? 'lanCN' : 'lanJP'}>
              <Descriptions.Item>{props.detail.description}</Descriptions.Item>
            </Descriptions>
          </Panel>
        </Collapse>
        <br />  
        <Collapse defaultActiveKey={['1']}>
          <Panel header={t('Product.howToUse')}>
            <Descriptions>
              <Descriptions.Item>{props.detail.usage}</Descriptions.Item>
            </Descriptions>
          </Panel>
        </Collapse>
        <br />
        <div style={{ display:'flex', justifyContent:'center' }} >
          <Button onClick={listHandler}>
            Landing Page
          </Button>
        {/* 관리자인 경우 */}
        { User.role === 2 && 
          <>
            <Button type="primary" onClick={modifyHandler}>
              Modify
            </Button>
            <Button type="danger" onClick={deleteHandler}>
              Delete
            </Button>
          </>
        }
        {/* 일반사용자이고 상품재고가 있는 경우 */}
        { User.role === 0 && !SoldOutTag &&  
          <Button type="primary" onClick={cartHandler}>
            Add to Cart
          </Button>
        }
        </div>
      </div>
    )
  // 로그인 전
  } else {
    return (
      <div>
        <Descriptions>
          <Descriptions.Item label={t('Product.price')}>{Number(props.detail.price).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label={t('Product.contents')}>{props.detail.contents}</Descriptions.Item>
          <Descriptions.Item >
            {IsSaleTag && <Tag color="#f50">&nbsp;&nbsp;{SALE_TAG}&nbsp;&nbsp;</Tag>}
            {IsRecTag && <Tag color="#fa0">{NOTICE_TAG}</Tag>}
            {SoldOutTag && <Tag color="#0af">{SOLD_OUT_TAG}</Tag>}
          </Descriptions.Item>
        </Descriptions>
        
        <Collapse defaultActiveKey={['0']}>
          <Panel header={t('Product.description')}>
            <Descriptions className={isLanguage === "cn" ? 'lanCN' : 'lanJP'}>
              <Descriptions.Item>{props.detail.description}</Descriptions.Item>
            </Descriptions>
          </Panel>
        </Collapse>
        <br />
        <Collapse defaultActiveKey={['1']}>
          <Panel header={t('Product.howToUse')}>
            <Descriptions>
              <Descriptions.Item>{props.detail.usage}</Descriptions.Item>
            </Descriptions>
          </Panel>
        </Collapse>
        <br />
        <div style={{ display:'flex', justifyContent:'center' }} >          
          <Button onClick={listHandler}>
            Landing Page
          </Button>
          {/* 상품재고가 있는 경우 */}
          { !SoldOutTag &&  
            <Button type="primary" onClick={cartHandler}>
              Add to Cart
            </Button>
          }
        </div>
      </div>
    )
  }
}

export default ProductInfo;