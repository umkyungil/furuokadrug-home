import React from 'react'
import { Button, Descriptions } from 'antd';
import { useDispatch } from 'react-redux'
import { addToCart } from '../../../../_actions/user_actions';
import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import axios from 'axios';

function ProductInfo(props) {
  const user = useSelector(state => state.user)

  const history = useHistory();
  const dispatch = useDispatch();

  const clickHandler = () => {
    // 필요한 정보를 Cart필드에 넣어준다
    dispatch(addToCart(props.detail._id));
  }

  const deleteHandler = () => {
    const body = {
      id: props.detail._id,
      images: props.detail.images
    }

    axios.post('/api/product/delete', body)
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

  // 未ログイン
  if (user.userData && !user.userData.isAuth) {
    return (
      <div>
        <Descriptions title="Product Info">
          <Descriptions.Item label="Price">{props.detail.price}</Descriptions.Item>
          <Descriptions.Item label="Sold">{props.detail.sold}</Descriptions.Item>
          <Descriptions.Item label="View">{props.detail.views}</Descriptions.Item>
          <Descriptions.Item label="Description">{props.detail.description}</Descriptions.Item>
        </Descriptions>

        <br />
        <br />
        <br />
        <div style={{ display:'flex', justifyContent:'center' }} >
          <Button size="large" shape="round" type="primary" onClick={listHandler}>
            Product List
          </Button>
        </div>
      </div>
    )
  } else {
    return (
      <div>
        <Descriptions title="Product Info">
          <Descriptions.Item label="Price">{props.detail.price}</Descriptions.Item>
          <Descriptions.Item label="Sold">{props.detail.sold}</Descriptions.Item>
          <Descriptions.Item label="View">{props.detail.views}</Descriptions.Item>
          <Descriptions.Item label="Description">{props.detail.description}</Descriptions.Item>
        </Descriptions>

        <br />
        <br />
        <br />
        <div style={{ display:'flex', justifyContent:'center' }} >
          <Button size="large" shape="round" type="primary" onClick={listHandler}>
            Product List
          </Button>
          &nbsp;&nbsp;&nbsp;
          <Button size="large" shape="round" type="primary" onClick={clickHandler}>
            Add to Cart
          </Button>
          &nbsp;&nbsp;&nbsp;
          <Button size="large" shape="round" type="danger" onClick={deleteHandler}>
            Delete
          </Button>
        </div>
      </div>
    )
  }
}

export default ProductInfo
