import React, { useEffect, useState, useContext } from 'react';
import { Button, Descriptions, Collapse } from 'antd';
import { useDispatch } from 'react-redux';
import { addToCart, anyRegisterUser, loginUser } from '../../../../_actions/user_actions';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { PRODUCT_SERVER, USER_SERVER } from '../../../Config.js';
import { useTranslation } from 'react-i18next';
import { useCookies } from "react-cookie";
import { LanguageContext } from '../../../context/LanguageContext';
// CORS 대책
axios.defaults.withCredentials = true;

// props 상품정보
function ProductInfo(props) {
  const history = useHistory();
  const dispatch = useDispatch();
  const {Panel} = Collapse;
  const productInfo = props.productInfo;
  const userInfo = props.userInfo;
  const price = Number(productInfo.price).toLocaleString();
  const point = Number(productInfo.point).toLocaleString();
  const [Cookies, setCookie, removeCookie] = useCookies(["w_auth"]);
  const [User, setUser] = useState({});
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국적언어 설정
    i18n.changeLanguage(isLanguage);
    // 사용자 정보 로컬스토리지에서 가져오기
    const userId = localStorage.getItem("userId");
    if (userId) {
      getUser(userId);
    }
	}, [])

  // 사용자정보 가져오기
  const getUser = async(userId) => {
    try {
      const result = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);
      if (result.data.success) {
        setUser(result.data.user[0]);
      }
    } catch (err) {
      console.log("getUser err: ",err);
    }
  } 

  // 카트 넣기
  const cartHandler = async () => {
    try {
      // 로그인 한 경우
      if (!userInfo.userData.error) {
        // 필요한 정보를 Cart필드에 넣어준다
        dispatch(addToCart(productInfo._id));
      } else {
        // 세션스토리지에 사용자아이디가 없는경우 사용자 아이디를 생성하고 카트 정보를 넣는다
        if (!sessionStorage.getItem("userId")) {
          // 불특정 사용자가 존재하는지 확인
          let body = { searchTerm: "Anonymous" }
          const users = await axios.post(`${USER_SERVER}/anonymous/list`, body);
          if (users.data.success) {
            let count = 0;
            if (users.data.userInfo.length > 0) {
              count = users.data.userInfo.length;
            }          
            count += 1;

            // 불특정 사용자수(카운트)에 따라 이메일등을 변경해서 사용자를 생성
            let regUserToSubmit = {
              name: "Anonymous" + count,
              lastName: "Anonymous" + count,
              birthday: "19700911",
              email: "anonymous"+count+"@hirosophy.co.jp",
              tel: "03-6701-7003",
              password: "Anonymous",
              confirmPassword: '',
              address1: "東京都港区芝4-6-4 ヒロソフィー三田ビル",
              receiver1: "株式会社ヒロソフィー",
              tel1: "03-6701-7003",
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
                let value = "Anonymous" + count;
                let body = { searchTerm: value }
                const users = await axios.post(`${USER_SERVER}/anonymous/list`, body);

                // 불특정 사용자 로그인 
                let dataToSubmit = {
                  email: users.data.userInfo[0].email,
                  password: "Anonymous"
                };
                dispatch(loginUser(dataToSubmit))
                .then(anyLogin => {
                  if (anyLogin.payload.loginSuccess) {
                    // sessionStorage에 등록
                    sessionStorage.setItem('userId', anyLogin.payload.userInfo._id);
                    sessionStorage.setItem('userName', "Anonymous");

                    // 필요한 정보를 Cart필드에 넣어준다
                    dispatch(addToCart(productInfo._id));
                  }
                })
              }
            })
          }
        } else {
          // 로컬스토리지에 userId가 있는 경우
          //   불특정 사용자가 상품을 추가하기 위해서 add to cart 버튼을 1회 이상 눌렀을때
          //   또는 Landing page로 이동해서 다른상품을 클릭하고 이 페이지에서 버튼을 눌렀을때
          //   페이지를 임의로 종료하거나 해서 로컬스토리지에 정보가 남아 있는데 로그인이 되지 않은 경우
          const userId = sessionStorage.getItem("userId");
          const userName = sessionStorage.getItem("userName");
          // 쿠키에 토큰정보가 없는경우
          if (!Cookies.hasOwnProperty("w_auth")) {
            // 로컬스토리지에 붙특정 사용자의 정보가 있는경우 로그인 처리
            if (userName === "Anonymous") {
              // 로그인해서 토큰정보를 쿠키에 저장
              const userInfo = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);
              if (userInfo.data.success) {
                let dataToSubmit = {
                  email: userInfo.data.user[0].email,
                  password: "Anonymous"
                };

                dispatch(loginUser(dataToSubmit))
                .then(anyLogin => {
                  if (anyLogin.payload.loginSuccess) {
                    // localStorage에 등록
                    sessionStorage.setItem('userId', anyLogin.payload.userInfo._id);
                    sessionStorage.setItem('userName', "Anonymous");

                    // 필요한 정보를 Cart필드에 넣어준다
                    dispatch(addToCart(productInfo._id));
                  }
                })
              }
            }
          } else {
            if (userName === "Anonymous") {
              dispatch(addToCart(productInfo._id));
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
    history.push(`/product/update/${productInfo._id}`);
  }
  // 상품 삭제
  const deleteHandler = () => {
    const body = {
      id: productInfo._id,
      images: productInfo.images
    }

    axios.post(`${PRODUCT_SERVER}/delete`, body)
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
  if (User) {
    // 일반사용자인 경우
    if (User.role === 0) {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label={t('Product.price')}>{price}</Descriptions.Item>
            <Descriptions.Item label={t('Product.point')}>{productInfo.point}</Descriptions.Item>
            <Descriptions.Item label={t('Product.contents')}>{productInfo.contents}</Descriptions.Item>          
          </Descriptions>
          <Collapse defaultActiveKey={['0']}>
            <Panel header={t('Product.description')}>
              <Descriptions>
                <Descriptions.Item>{productInfo.description}</Descriptions.Item>
              </Descriptions>
            </Panel>
          </Collapse>
          <br />  
          <Collapse defaultActiveKey={['1']}>
            <Panel header={t('Product.howToUse')}>
              <Descriptions>
                <Descriptions.Item>{productInfo.usage}</Descriptions.Item>
              </Descriptions>
            </Panel>
          </Collapse>
          <br />
          <div style={{ display:'flex', justifyContent:'center' }} >
            <Button onClick={listHandler}>
              Landing Page
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button type="primary" onClick={cartHandler}>
              Add to Cart
            </Button>
          </div>
        </div>
      )
    // 스텝인 경우
    } else if (User.role === 1) {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label={t('Product.price')}>{price}</Descriptions.Item>
            <Descriptions.Item label={t('Product.point')}>{productInfo.point}</Descriptions.Item>
            <Descriptions.Item label={t('Product.contents')}>{productInfo.contents}</Descriptions.Item>          
          </Descriptions>
          <Collapse defaultActiveKey={['0']}>
            <Panel header={t('Product.description')}>
              <Descriptions>
                <Descriptions.Item>{productInfo.description}</Descriptions.Item>
              </Descriptions>
            </Panel>
          </Collapse>
          <br />  
          <Collapse defaultActiveKey={['1']}>
            <Panel header={t('Product.howToUse')}>
              <Descriptions>
                <Descriptions.Item>{productInfo.usage}</Descriptions.Item>
              </Descriptions>
            </Panel>
          </Collapse>
          <br />
          <div style={{ display:'flex', justifyContent:'center' }} >
            <Button onClick={listHandler}>
              Landing Page
            </Button>
          </div>
        </div>
      )
    // 관리자인 경우
    } else if (User.role === 2) {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label={t('Product.price')}>{price}</Descriptions.Item>
            <Descriptions.Item label={t('Product.point')}>{productInfo.point}</Descriptions.Item>
            <Descriptions.Item label={t('Product.contents')}>{productInfo.contents}</Descriptions.Item>          
          </Descriptions>
          <Collapse defaultActiveKey={['0']}>
            <Panel header={t('Product.description')}>
              <Descriptions>
                <Descriptions.Item>{productInfo.description}</Descriptions.Item>
              </Descriptions>
            </Panel>
          </Collapse>
          <br />  
          <Collapse defaultActiveKey={['1']}>
            <Panel header={t('Product.howToUse')}>
              <Descriptions>
                <Descriptions.Item>{productInfo.usage}</Descriptions.Item>
              </Descriptions>
            </Panel>
          </Collapse>
          <br />
          <div style={{ display:'flex', justifyContent:'center' }} >
            <Button onClick={listHandler}>
              Landing Page
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button type="primary" onClick={modifyHandler}>
              Modify
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button type="danger" onClick={deleteHandler}>
              Delete
            </Button>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label={t('Product.price')}>{price}</Descriptions.Item>
            <Descriptions.Item label={t('Product.point')}>{point}</Descriptions.Item>
            <Descriptions.Item label={t('Product.contents')}>{productInfo.contents}</Descriptions.Item>
          </Descriptions>
          <Collapse defaultActiveKey={['0']}>
            <Panel header={t('Product.description')}>
              <Descriptions>
                <Descriptions.Item>{productInfo.description}</Descriptions.Item>
              </Descriptions>
            </Panel>
          </Collapse>
          <br />
          <Collapse defaultActiveKey={['1']}>
            <Panel header={t('Product.howToUse')}>
              <Descriptions>
                <Descriptions.Item>{productInfo.usage}</Descriptions.Item>
              </Descriptions>
            </Panel>
          </Collapse>
          <br />
          <div style={{ display:'flex', justifyContent:'center' }} >
            <Button onClick={listHandler}>
              Landing Page
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button type="primary" onClick={cartHandler}>
              Add to Cart
            </Button>
          </div>
        </div>
      )
    }
  // 로그인 전
  } else {
    return (
      <div>
        <Descriptions>
          <Descriptions.Item label={t('Product.price')}>{price}</Descriptions.Item>
          <Descriptions.Item label={t('Product.point')}>{point}</Descriptions.Item>
          <Descriptions.Item label={t('Product.contents')}>{productInfo.contents}</Descriptions.Item>
        </Descriptions>
        <Collapse defaultActiveKey={['0']}>
          <Panel header={t('Product.description')}>
            <Descriptions>
              <Descriptions.Item>{productInfo.description}</Descriptions.Item>
            </Descriptions>
          </Panel>
        </Collapse>
        <br />
        <Collapse defaultActiveKey={['1']}>
          <Panel header={t('Product.howToUse')}>
            <Descriptions>
              <Descriptions.Item>{productInfo.usage}</Descriptions.Item>
            </Descriptions>
          </Panel>
        </Collapse>
        <br />
        <div style={{ display:'flex', justifyContent:'center' }} >
          <Button onClick={listHandler}>
            Landing Page
          </Button>
          &nbsp;&nbsp;&nbsp;
          <Button type="primary" onClick={cartHandler}>
            Add to Cart
          </Button>
        </div>
      </div>
    )
  }
}

export default ProductInfo