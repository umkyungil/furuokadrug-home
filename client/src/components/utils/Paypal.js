import React from 'react';
import PaypalExpressBtn from 'react-paypal-express-checkout'

export default class Paypal extends React.Component {
  render() {
    const onSuccess = (payment) => {
      // CartPage의 콜백함수(payment를 파라메터를 대입해서 함수를 실행한다)
      this.props.onSuccess(payment)
    }

    const onCancel = (data) => {
      console.log("The payment was cancelled!", data);
    }

    const onError = (err) => {
      console.log("Error!", err);
      this.props.onError(err)
    }

    // 환경및 금액 설정
    let env = 'sandbox'; // ここで本番環境の場合は「production」に設定できます  
    let currency = 'JPY';
    let total = this.props.total; // 카트페이지의 프롭스

    // client: Object (with "sandbox" and "production" as keys) - MUST set, please see the above example
    const client = {
      sandbox: 'AXPs50Sbc6RHQtToi9SCeh2t9ApIinzGFi4CvI8E_4RR02ROTsO5uVHTT6np1Ric2TgouucvaQYrCem_',
      production: 'your production app id',
    }
    // プロダクションのアプリ ID を取得するには、まずアプリを Paypal に送信して承認を得る必要があります
    // サンドボックス アプリ ID の場合 (開発者アカウントにログインした後、「REST API アプリ」セクションを見つけて、「アプリの作成」をクリックしてください):
    //    =>  https://developer.paypal.com/docs/classic/lifecycle/sb_credentials/
    // 実稼働アプリ ID の場合:
    //    =>  https://developer.paypal.com/docs/classic/lifecycle/goingLive/

    return (
      <PaypalExpressBtn
        env={env}
        client={client}
        currency={currency}
        total={total}
        onError={onError}
        onSuccess={onSuccess}
        onCancel={onCancel}
        style={{
          size: 'large',
          color: 'blue',
          shape: 'rect',
          label: 'checkout'
        }}
      />
    );
  }
}