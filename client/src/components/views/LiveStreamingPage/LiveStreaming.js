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
    URL = LIVE_SERVER + "login?name=" + name + "&room=" + room + "&userId=" + userId + "&type=ec";
    console.log("URL: ", URL);
  }

  React.useEffect(() => {
    // 자식화면에서 송신한 데이타를 수렴(비디오 채팅 결제금액) 
    window.addEventListener('message', function(e) {
      if(e.data.type != "exitRoom") {
        const type = e.data.type;       
        const loginUserId = e.data.loginUserId; // ECSystem 로그인 유저ID
        const sid = e.data.sid;
        const sod = e.data.sod;
        const siam1 = e.data.siam1; // amount
        const uniqueField = e.data.uniqueField;

        const settings = "toolbar=0,menubar=0,scrollbars=auto,resizable=no,height=915,width=412,top=100px,left=100";      
        if (e.data.loginUserId && e.data.siam1) {
          if (type === "alipay") {
            // 결제 페이지 호출
            let url = `/payment/alipay/confirm/${loginUserId}/${sid}/${sod}/${siam1}/${uniqueField}`
            window.open(url,"alipay", settings);
          } else if (type === "wechat") {
            // 결제 페이지 호출
            let url = `/payment/wechat/confirm/${loginUserId}/${sid}/${sod}/${siam1}/${uniqueField}`
            window.open(url,"alipay", settings);
          }
        }
      } else {
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
      {/* responsive 대응하지 않은 화면 */}
      {/* <iframe id={video} allow="microphone; camera" width="1900" height="800" src={URL} frameBorder="0" scrolling="yes" /> */}
    </div>
  )
}

export default LiveStreaming