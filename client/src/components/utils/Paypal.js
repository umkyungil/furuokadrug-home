import React from 'react';
import PaypalExpressBtn from 'react-paypal-express-checkout'

export default class Paypal extends React.Component {
  render() {
    const onSuccess = (payment) => {
      console.log("The payment was succeeded!", payment);
      // CartPage의 콜백함수(payment를 파라메터를 대입해서 함수를 실행한다)
      this.props.onSuccess(payment)
    }

    const onCancel = (data) => {
      console.log("The payment was cancelled!", data);
    }

    const onError = (err) => {
      console.log("Error!", err);
    }

    let env = 'sandbox';
    let currency = 'JPY';
    let total = this.props.total; // 카트페이지의 프롭스

    const client = {
      sandbox: 'AXPs50Sbc6RHQtToi9SCeh2t9ApIinzGFi4CvI8E_4RR02ROTsO5uVHTT6np1Ric2TgouucvaQYrCem_',
      production: 'your production app id',
    }

    return (
      <PaypalExpressBtn 
        env={env} 
        client={client} 
        currency={currency} 
        total={total} 
        onError={onError} 
        onSuccess={onSuccess} 
        onCancel={onCancel}
        style = {{
          size: 'large',
          color: 'blue',
          shape: 'rect',
          label: 'checkout'
        }}
      />);
  }    
}