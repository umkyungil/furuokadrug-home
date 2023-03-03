import React, { useState, useEffect, useContext } from 'react';
// import LeftMenu from './Sections/LeftMenu';
import RightMenu from './Sections/RightMenu';
import { IMAGES_SERVER } from '../../Config';
import { IMAGES_TYPE, IMAGES_VISIBLE_ITEM, IMAGES_LANGUAGE, I18N_ENGLISH, I18N_CHINESE, I18N_JAPANESE } from '../../utils/Const';
import { LanguageContext } from '../../context/LanguageContext';
import { Drawer, Button, Icon } from 'antd';
import './Sections/Navbar.css';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

function NavBar() {
  const [visible, setVisible] = useState(false)
  const [image, setImage] = useState("")
  const {isLanguage} = useContext(LanguageContext);

  useEffect(() => {
    // 다국적언어 설정
		getLogo();
	}, [])

   // 배너 가져오기
	const getLogo = async () => {
		try {
      console.log("isLanguage: ", isLanguage);
      
      let imgLan = "";
      if (isLanguage === "" || isLanguage === I18N_JAPANESE) {
        imgLan = IMAGES_LANGUAGE[0]._id
      } else if (isLanguage === I18N_CHINESE) {
        imgLan = IMAGES_LANGUAGE[1]._id
      } else if (isLanguage === I18N_ENGLISH) {
        imgLan = IMAGES_LANGUAGE[2]._id
      }
      const image = await axios.post(`${IMAGES_SERVER}/images_by_type`, {type: IMAGES_TYPE[0]._id, visible: IMAGES_VISIBLE_ITEM[1]._id, language: imgLan});
      if (image.data.imageInfo.length > 0) {
        setImage(image.data.imageInfo[0].image);
      }
		} catch (err) {
			console.log("err: ",err);
		}
	}

  const showDrawer = () => {
    setVisible(true)
  };

  const onClose = () => {
    setVisible(false)
  };

  return (
    <>
      <nav className="menu" style={{ position: 'fixed', zIndex: 5, width: '100%', padding: '10px', height:"80px"}}>
        <div className="menu__logo">
          {/* <a href="/" ><img style={{ width:"270px" }} src={ require('./fd_logo670.png')} /></a> */}
          <a href="/" ><img style={{ width:"270px" }} src={image} /></a>
        </div>
        <div className="menu__container">
          {/* <div className="menu_left">
            <LeftMenu mode="horizontal" />
          </div> */}
          <div className="menu_right">
            <RightMenu mode="horizontal" />
          </div>
          <Button
            className="menu__mobile-button"
            type="primary"
            onClick={showDrawer}
          >
            <Icon type="align-right" />
          </Button>
          <Drawer
            title="FURUOKADRUG"
            placement="right"
            className="menu_drawer"
            closable={false}
            onClose={onClose}
            visible={visible}
          >
            {/* <LeftMenu mode="inline" /> */}
            <RightMenu mode="inline" />
          </Drawer>
        </div>
      </nav>
    </>
  )
}

export default NavBar;