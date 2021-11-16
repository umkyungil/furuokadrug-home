import React, { useState } from 'react'
import { Collapse, Checkbox } from 'antd'

const { Panel } = Collapse;

function CheckBox(props) {

  const [Checked, setChecked] = useState([]);
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

    setChecked(newChecked)
    props.handleFilters(newChecked);
  }



  // props.list && : props.list가 있으면 그 이후의 처리를 한다
  const renderCheckBoxLists = () => props.list && props.list.map((value, index) => (
    <React.Fragment key={index}>
      <Checkbox onChange={ () => handleToggle(value._id) } 
        checked={ Checked.indexOf(value._id) === -1 ? false : true } />
      <span>{value.name}</span>

    </React.Fragment>

  ))

  return (
    <div>
      <Collapse defaultActiveKey={['1']}>
        <Panel header="This is panel header 1" key="1">
          {renderCheckBoxLists()}
          
        </Panel>
      </Collapse>
    </div>
  )
}

export default CheckBox
