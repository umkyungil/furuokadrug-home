import React, { useState, useEffect } from 'react';
import { Collapse, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';

const { Panel } = Collapse;

function CheckBox(props) {
  const [Checked, setChecked] = useState([]);

  useEffect(() => {
    // 다국적언어 설정
		setLanguage(localStorage.getItem("i18nextLng"));
	}, [])

  const handleToggle = (value) => {
    // 누른 것의 Index를 구하고
    const currentIndex = Checked.indexOf(value);
    // 전체 Checked된 State에서 현재 누른 Check
    const newChecked = [...Checked]
    // State 넣어준다
    if (currentIndex === -1) {
      newChecked.push(value);
    // 빼준다  
    } else {
      newChecked.splice(currentIndex, 1);
    }

    // 선택된 값을 변경한다
    setChecked(newChecked)
    // 부모Component에 선택된 값을 보낸다
    props.handleFilters(newChecked);
  }

  // props.list && : props.list가 있으면 그 이후의 처리를 한다
  const renderCheckBoxLists = () => props.list && props.list.map((value, index) => (
    <React.Fragment key={index}>
      <Checkbox onChange={() => handleToggle(value._id)} 
        checked={ Checked.indexOf(value._id) === -1 ? false : true } />&nbsp;
      <span>{value.name}</span>&nbsp;&nbsp;&nbsp;

    </React.Fragment>
  ))

  // 다국적언어 설정
	const {t, i18n} = useTranslation();
  function setLanguage(lang) {
    i18n.changeLanguage(lang);
  }

  return (
    <div>
      <Collapse defaultActiveKey={['0']}>
        <Panel header={t('Product.itemSelection')} key="1">
          {/* 체크박스를 표시 */}
          {renderCheckBoxLists()}
        </Panel>
      </Collapse>
    </div>
  )
}

export default CheckBox
