import React from 'react';
import { Menu } from 'antd';
// Multi Language
import { useTranslation } from 'react-i18next';

const SubMenu = Menu.SubMenu;

function LeftMenu(props) {
  // 다국적언어
	const {t, i18n} = useTranslation();
  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
  }

  return (
    <Menu mode={props.mode}>
      <Menu.Item key="home">
        <a href="/">Home</a>
      </Menu.Item>
      <Menu.Item key="reservation">
        <a href="/mail/reservation">Reservation</a>
      </Menu.Item>
      <SubMenu title={<span>Language</span>}>          
        <Menu.Item key="english">
          <span onClick={() => setLanguage('en')}>english</span>
        </Menu.Item>
        <Menu.Item key="japanese">
          <span onClick={() => setLanguage('jp')}>japanese</span>
        </Menu.Item>
        <Menu.Item key="chinese">
          <span onClick={() => setLanguage('cn')}>chinese</span>
        </Menu.Item>
      </SubMenu>
    </Menu>
  )
}

export default LeftMenu