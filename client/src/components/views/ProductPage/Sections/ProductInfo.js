import React, {useState, useEffect} from 'react';
import { Button, Descriptions, Collapse } from 'antd';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../../_actions/user_actions';
import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import axios from 'axios';
import { PRODUCT_SERVER } from '../../../Config.js';
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

function ProductInfo(props) {
  const [value, setValue] = React.useState('1');
  const user = useSelector(state => state.user)
  const history = useHistory();
  const dispatch = useDispatch();
  const { Panel } = Collapse;
  const price = Number(props.detail.price).toLocaleString();
  const point = Number(props.detail.point).toLocaleString();

  useEffect(() => {
    // 다국적언어 설정
		setMultiLanguage(localStorage.getItem("i18nextLng"));
	}, [])

  // 카트 넣기
  const cartHandler = () => {
    // 필요한 정보를 Cart필드에 넣어준다
    dispatch(addToCart(props.detail._id));
  }
  // 상품 수정
  const modifyHandler = () => {
    history.push(`/product/update/${props.detail._id}`);
  }
  // 상품 삭제
  const deleteHandler = () => {
    const body = {
      id: props.detail._id,
      images: props.detail.images
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

  function onChange(value) {
    console.log('changed', value);
  }

  // 다국적언어 설정
	const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);
  }

  // 로그인 후
  if (user.userData) {
    // 일반사용자인 경우
    if (user.userData.role === 0) {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label={t('Product.price')}>{price} 円</Descriptions.Item>
            <Descriptions.Item label={t('Product.point')}>{props.detail.point}</Descriptions.Item>
            <Descriptions.Item label={t('Product.contents')}>{props.detail.contents}</Descriptions.Item>          
          </Descriptions>
          <Collapse defaultActiveKey={['0']}>
            <Panel header={t('Product.description')}>
              <Descriptions>
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
            &nbsp;&nbsp;&nbsp;
            <Button type="primary" onClick={cartHandler}>
              Add to Cart
            </Button>
          </div>
        </div>
      )
    // 관리자인 경우
    } else if (user.userData.role === 2) {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label={t('Product.price')}>{price} 円</Descriptions.Item>
            <Descriptions.Item label={t('Product.point')}>{props.detail.point}</Descriptions.Item>
            <Descriptions.Item label={t('Product.contents')}>{props.detail.contents}</Descriptions.Item>          
          </Descriptions>
          <Collapse defaultActiveKey={['0']}>
            <Panel header={t('Product.description')}>
              <Descriptions>
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
    // 스텝인 경우
    } else {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label={t('Product.price')}>{price} 円</Descriptions.Item>
            <Descriptions.Item label={t('Product.point')}>{props.detail.point}</Descriptions.Item>
            <Descriptions.Item label={t('Product.contents')}>{props.detail.contents}</Descriptions.Item>          
          </Descriptions>
          <Collapse defaultActiveKey={['0']}>
            <Panel header={t('Product.description')}>
              <Descriptions>
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
          </div>
        </div>
      )
    }
  // 로그인 전
  } else {
    return (
      <div>
        <Descriptions>
          <Descriptions.Item label={t('Product.price')}>{price} 円</Descriptions.Item>
          <Descriptions.Item label={t('Product.point')}>{point}</Descriptions.Item>
          <Descriptions.Item label={t('Product.contents')}>{props.detail.contents}</Descriptions.Item>
        </Descriptions>
        <Collapse defaultActiveKey={['0']}>
          <Panel header={t('Product.description')}>
            <Descriptions>
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
          <Button size="large" onClick={listHandler}>
            Landing Page
          </Button>
        </div>
      </div>
    )
  }
}

export default ProductInfo