import React, {useState} from 'react';
import { Button, Descriptions, Collapse, InputNumber, Space } from 'antd';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../../_actions/user_actions';
import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import axios from 'axios';
import { PRODUCT_SERVER } from '../../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function ProductInfo(props) {
  const [value, setValue] = React.useState('1');

  const user = useSelector(state => state.user)
  const history = useHistory();
  const dispatch = useDispatch();
  const { Panel } = Collapse;
  // 금액에 콤마 추가
  const price = Number(props.detail.price).toLocaleString();
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

  // 로그인 전
  if (user.userData && !user.userData.isAuth) {
    return (
      <div>
        <InputNumber min={1} max={10} defaultValue={value} onChange={setValue} />&nbsp;
        <Button type="primary" onClick={cartHandler}>
          Add Cart
        </Button>
        <br />
        <br />
        <Descriptions bordered>
          <Descriptions.Item label="Price">{price}</Descriptions.Item>
          <Descriptions.Item label="Point">{props.detail.point}</Descriptions.Item>
          <Descriptions.Item label="Sold">{props.detail.sold}</Descriptions.Item>
          <Descriptions.Item label="Description">{props.detail.description}</Descriptions.Item>
        </Descriptions>
        <br />
        <Collapse defaultActiveKey={['0']}>
          <Panel header="Usage">
            <Descriptions>
              <Descriptions.Item>{props.detail.usage}</Descriptions.Item>
            </Descriptions>
          </Panel>
        </Collapse>
        <br />
        <div style={{ display:'flex', justifyContent:'center' }} >
          <Button size="large" onClick={listHandler}>
            Product List
          </Button>
        </div>
      </div>
    )
  } else {
    return (
      <div>
        <Descriptions title="Product Info" bordered>
          <Descriptions.Item label="Price">{price}</Descriptions.Item>
          <Descriptions.Item label="Point">{props.detail.point}</Descriptions.Item>
          <Descriptions.Item label="Sold">{props.detail.sold}</Descriptions.Item>
          <Descriptions.Item label="Description">{props.detail.description}</Descriptions.Item>
        </Descriptions>
        <br />
        <Collapse defaultActiveKey={['1']}>
          <Panel header="Usage">
            <Descriptions>
              <Descriptions.Item>{props.detail.usage}</Descriptions.Item>
            </Descriptions>
          </Panel>
        </Collapse>
        <br />
        <div style={{ display:'flex', justifyContent:'center' }} >
          <Button size="large" onClick={listHandler}>
            Product List
          </Button>
          &nbsp;&nbsp;&nbsp;
          <Button size="large" type="primary" onClick={cartHandler}>
            Add to Cart
          </Button>
          &nbsp;&nbsp;&nbsp;
          <Button size="large" type="primary" onClick={modifyHandler}>
            Modify
          </Button>
          &nbsp;&nbsp;&nbsp;
          <Button size="large" type="danger" onClick={deleteHandler}>
            Delete
          </Button>
        </div>
      </div>
    )
  }
}

export default ProductInfo