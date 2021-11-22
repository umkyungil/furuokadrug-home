import React, { useEffect } from 'react'
import axios from 'axios'

function DetailCustomerPage(props) {

  const customerId = props.match.params.customerId;

  useEffect(() => {
    axios.get(`/api/customer/customers_by_id?id=${customerId}&type=single`)
      .then(response => {
        if (response.data.success) {
          console.log(response.data);
        } else {
          alert("고객 정보 가져오기를 실패했습니다.")
        }
      })
  }, [])

  return (
    <div>
      DetailCustomerPage
    </div>
  )
}

export default DetailCustomerPage
