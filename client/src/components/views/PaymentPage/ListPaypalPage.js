import React from 'react'

function ListPaypalPage(props) {

  return (
    <div style={{ width:'80%', margin: '3rem auto'}}>
      <div style={{ textAlign: 'center' }}>
        <h1>Paypal Payment History</h1>
      </div>
      <br />

      <table>
        <thead>
          <tr>
            <th>Payment Id</th>            
            <th>Product Name</th>
            <th>Price</th>
            <th>Quantity</th>            
            <th>Date of Purchase</th>
          </tr>
        </thead>
        <tbody>
          {props.user.userData && props.user.userData.history.map((item, idx) => (
            <tr key={idx}>
              <td>{item.paymentId}</td>
              <td>{item.name}</td>
              <td>¥ {Number(item.price).toLocaleString()}</td>
              <td>{item.quantity}</td>  
              <td>{item.dateOfPurchase}</td>
            </tr>
          ))}            
        </tbody>
      </table>
    </div>
  )
}
  


export default ListPaypalPage;