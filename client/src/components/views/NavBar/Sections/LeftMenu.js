import React from 'react';
import { Menu } from 'antd';

function LeftMenu(props) {

  const chatHandler = () => {
    let href = "https://umkyungil.github.io/furuokadrug-twitter/#/";
    let w = 450;
    let h = 800;
    let xPos = (document.body.offsetWidth-w); //오른쪽 정렬
    let yPos = (document.body.offsetHeight/2) - (h/2);

    window.open(href, "pop_name", "width="+w+", height="+h+", left="+xPos+", top="+yPos+", menubar=yes, status=yes, titlebar=yes, resizable=yes");
  };

  const liveHandler = () => {
    let href = "https://live.furuokadrug.com"
    let w = 1900;
    let h = 700;
    let xPos = (document.body.offsetWidth-w); //오른쪽 정렬
    let yPos = (document.body.offsetHeight/2) - (h/2);

    window.open(href, "pop_name", "width="+w+", height="+h+", left="+xPos+", top="+yPos+", menubar=yes, status=yes, titlebar=yes, resizable=yes");
  };
  
  return (
    <Menu mode={props.mode}>
    <Menu.Item key="mail">
      <a href="/">Home</a>
    </Menu.Item>
    <Menu.Item key="reservation">
      <a href="/mail/reservation">Virtual Reservation</a>
    </Menu.Item>
    <Menu.Item key="chat">
      <a onClick={chatHandler}>Chat</a>
    </Menu.Item>
    <Menu.Item key="live">
      <a href="/live">Live Streaming</a>
    </Menu.Item>
    {/* <Menu.Item key="live">
      <a onClick={liveHandler}>Chat</a>      
    </Menu.Item> */}
  </Menu>
  )
}

export default LeftMenu