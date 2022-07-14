import React from 'react'
import "./UserCardBlock.css"
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

function UserCardBlock(props) {

  const renderCartImages = (images) => {
    if (images.length > 0) {
      let image = images[0]
      return image;
    }
  }
  const renderItems = () => (
    props.products && props.products.map((product, index) => (
      <tr key={index}>
        <td>
          <img style={{width: '120px', height: '120px'}} alt="product" src={renderCartImages(product.images)} />
        </td>
        <td>
          {product.quantity} {t('Cart.unit')}
        </td>
        <td>
          {Number(product.price).toLocaleString()}
        </td>
        <td>
          <Button onClick={() => props.removeItem(product._id)}>
            remove
          </Button>
        </td>
      </tr>
    ))
  )

  // 다국적언어 설정
	const {t, i18n} = useTranslation();

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>{t('Cart.image')}</th>
            <th>{t('Cart.quantity')}</th>
            <th>{t('Cart.price')}</th>
            <th>{t('Cart.remove')}</th>
          </tr>
        </thead>
        <tbody>
          {renderItems()}
        </tbody>
      </table>
    </div>
  )
}

export default UserCardBlock