import React, { useState } from 'react'
import Moment from 'moment';
import { LIVE_SERVER } from '../../Config';
import { useHistory } from 'react-router-dom';

function LiveStreaming(props) {
  const history = useHistory();
  let URL = "";

  // TODO: 화면이 두번 호출되서 첫번째는 props 값이 없고 두번째에 들어온다
  if (props.user.userData) { 
    const name = props.user.userData.name;
    const room = Moment(new Date()).format('YYYYMMDD');
    const userId = props.user.userData._id;
    // URL설정
    // if (props.user.userData.role === 0) {
      URL = LIVE_SERVER + "meet?name=" + name + "&room=" + room + "&userId=" + userId + "&type=ec";
    // } else {
    //   URL = LIVE_SERVER;
    // }
  }

  React.useEffect(() => {
    // 자식화면에서 송신한 데이타를 수신(비디오 채팅 결제금액등) 
    window.addEventListener('message', function(e) {
      if(e.data.type != "exitRoom") {
        const type = e.data.type;       
        const loginUserId = e.data.loginUserId; // ECSystem 로그인 유저ID
        const sid = e.data.sid;
        const sod = e.data.sod;
        const siam1 = e.data.siam1; // amount
        const uniqueField = e.data.uniqueField;
        let staffName = e.data.guestName;
        
        if (e.data.loginUserId && e.data.siam1) {
          if (type === "alipay") {
            // 결제 페이지 호출
            let url = `/payment/alipay/confirm/${loginUserId}/${sid}/${sod}/${siam1}/${uniqueField}/${staffName}`
            window.open(url);
          } else if (type === "wechat") {
            // 결제 페이지 호출
            let url = `/payment/wechat/confirm/${loginUserId}/${sid}/${sod}/${siam1}/${uniqueField}/${staffName}`
            window.open(url);
          }
        }
      } else {
        // 비디오 채팅화면에서 종료버튼을 눌렀을때 랜딩페이지로 이동
        history.push("/");
      }
    })
  }, [])

  return (
    <div>
      <iframe style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          width: '100%',
          height: '100%',
        }} allow="microphone; camera" src={URL} frameBorder="0" scrolling="yes"/>
    </div>
  )
}

export default LiveStreaming