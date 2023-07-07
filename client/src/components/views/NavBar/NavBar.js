import React, { useState, useEffect } from 'react';
// import LeftMenu from './Sections/LeftMenu';
import RightMenu from './Sections/RightMenu';
import { IMAGES_SERVER } from '../../Config';
import { PRODUCT_LIST_CATEGORY, IMAGES_TYPE, IMAGES_VISIBLE_ITEM, I18N_JAPANESE } from '../../utils/Const';
import SearchFeature from './Sections/SearchFeature';
import { Drawer, Button, Icon, Select } from 'antd';
import './Sections/Navbar.css';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;
const {Option} = Select;

function NavBar() {
  const [visible, setVisible] = useState(false);
  const [image, setImage] = useState("");
  const history = useHistory();

  useEffect(() => {
		getLogo();
	}, [])

   // 로고 가져오기
	const getLogo = async () => {
		try {
      const image = await axios.post(`${IMAGES_SERVER}/images_by_type`, {type: IMAGES_TYPE[0]._id, visible: IMAGES_VISIBLE_ITEM[1]._id, language: I18N_JAPANESE});
      if (image.data.imageInfo.length > 0) {
        setImage(image.data.imageInfo[0].image);
      }
		} catch (err) {
			console.log("err: ",err);
		}
	}

  // 키워드 검색시 상품 가져오기
	const handleSearchTerm = (newSearchTerm) => {
    if (newSearchTerm !== "") {
      // 상품리스트로 이동해서 키워드로 검색을 한다
      history.push(`/product/list/searchTerm/${newSearchTerm}`);
    }
	}

  // 카테고리 검색시 상품 가져오기
	const handleCategory = (category) => {
    if (category !== "") {
      // 상품리스트로 이동해서 카에고리 검색을 한다
      history.push(`/product/list/category/${category}`);
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
      {/* <nav className="menu" style={{ position: 'fixed', zIndex: 5, width: '100%', padding: '10px', height:"80px"}}>
        <div className="menu__logo">
          <a href="/" ><img style={{ width:"270px" }} src={image} /></a>
        </div> */}

      <nav className="menu" >
        <div className="menu__logo">
          <a href="/" ><img style={{ width:"270px" }} src={image} alt='logo'/></a>
          {/* <a href="/" ><img style={{ width: "270px" }} src={image} /></a> */}
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
        {/* Search */}
        <div className="headMenu2">
          <SearchFeature refreshFunction={handleSearchTerm} />
        </div>
        <div className="listblock">
          <Select defaultValue="" style={{ width:"48%", float:"right", position:"relative", textAlign:"lest" }} onChange={handleCategory} >
            <Option key={0} value={""} > {""} </Option>
            {PRODUCT_LIST_CATEGORY.map(item => {
              // 카테고리에서 All제외
              if (item.key !== 0) {
                return (<Option key={item.key} value={item.key} > {item.value} </Option>);
              }
            })}
          </Select>
        </div>
      </nav>
    </>
  )
}

export default NavBar;