import React from 'react';
import { Menu } from 'antd';
// Multi Language
import { useTranslation } from 'react-i18next';

const SubMenu = Menu.SubMenu;

function LeftMenu(props) {
  // 다국적언어
	const {i18n} = useTranslation();
  const setMultiLanguage = (lang) => {
    i18n.changeLanguage(lang);
  }

  return (
    <Menu mode={props.mode}>
      <Menu.Item key="home">
        <a href="/">Home</a>
      </Menu.Item>
      <Menu.Item key="reserve">
        <a href="/mail/reserve">Reservation</a>
      </Menu.Item>
      <SubMenu title={<span>Language</span>}>          
        <Menu.Item key="english">
          <span onClick={() => setMultiLanguage('en')}>English</span>
        </Menu.Item>
        <Menu.Item key="japanese">
          <span onClick={() => setMultiLanguage('jp')}>日本語</span>
        </Menu.Item>
        <Menu.Item key="chinese">
          <span onClick={() => setMultiLanguage('cn')}>中文（簡体）</span>
        </Menu.Item>
      </SubMenu>
    </Menu>
  )
}

export default LeftMenu