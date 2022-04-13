import React, { useState, useEffect } from 'react';
import { Collapse, Radio } from 'antd';
import { useTranslation } from 'react-i18next';

const { Panel } = Collapse;

function RadioBox(props) {
  const [Value, setValue] = useState(0)

  useEffect(() => {
    // 다국적언어 설정
		setLanguage(localStorage.getItem("i18nextLng"));
	}, [])

   // props.list && : props.list가 있으면 그 이후의 처리를 한다
  const renderRadioBoxLists = () => props.list && props.list.map((value) => (
    <Radio key={value._id} value={value._id}> {value.name} </Radio>
  ))

  const handleChange = (event) => {
    setValue(event.target.value);
    // 부모 컨텐츠에 보내기(라디오라서 선택한건 하나만 보냄)
    props.handleFilters(event.target.value);
  }

  // 다국적언어 설정
	const {t, i18n} = useTranslation();
  function setLanguage(lang) {
    i18n.changeLanguage(lang);
  }

  return (
    <div>
      <Collapse defaultActiveKey={['0']}>
        <Panel header={t('Product.priceSelection')} key="1">
          {/* Radio Group으로 해야 하나만 선택이 된다 */}
          <Radio.Group onChange={handleChange} value={Value}>
            {/* radio를 표시 */}
            {renderRadioBoxLists()}
          </Radio.Group>
        </Panel>
      </Collapse>
    </div>
  )
}

export default RadioBox
