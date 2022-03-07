import React, { useState } from 'react'
import Moment from 'moment';

function LiveStreaming(props) {
  const [Url, setUrl] = useState("");

  const area = {
    position: 'relative', /* absolute는 부모가 relative일 때 부모를 따라간다. */
    width: '100%',
    paddingBottom: '56.25%', /* 16:9 비율 */
  }

  const video = {
    position: 'absolute',
    width: '1900px',
    height: '800px',
  }

  console.log("props: ",props.user.userData);
  
  // TODO: 화면이 두번 호출되서 첫번째는 props 값이 없고 두번째에 들어온다
  let URL = "";
  if (props.user.userData) { 
    const name = props.user.userData.name;
    const room = Moment(new Date()).format('YYYYMMDD');
    URL ="https://localhost:888/login?name=" + name + "&room=" + room;
    // URL ="https://live.furuokadrug.com/login?name=" + name + "&room=" + room;
  }

  React.useEffect(() => {
    // 자식화면에서 송신한 데이타를 수렴(비디오 채팅 결제금액) 
    window.addEventListener('message', function(e) {
      const amount = e.data.amount;
      if (e.data.amount) {
        // TODO 결제 페이지 호출
        alert(amount)

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
      {/* <iframe id={video} allow="microphone; camera" width="1900" height="800" src={URL} frameBorder="0" scrolling="yes" /> */}
    </div>
  )
}

export default LiveStreaming