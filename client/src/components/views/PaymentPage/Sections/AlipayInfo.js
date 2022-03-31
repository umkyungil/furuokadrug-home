import React, { useState } from 'react';
import { Button, Descriptions } from 'antd';
import { useHistory } from 'react-router-dom';

function AlipayInfo(props) {
  const history = useHistory();
  const listHandler = () => {
    history.push("/payment/alipay/list");
  }

 return (
    <div>
      <Descriptions>
        <Descriptions.Item label="サービス">Alipay決済</Descriptions.Item>
        <Descriptions.Item label="決済番号">{props.detail.pid}</Descriptions.Item>
        <Descriptions.Item label="処理結果">{props.detail.rst}</Descriptions.Item>
        <Descriptions.Item label="管理番号">{props.detail.ap}</Descriptions.Item>
        <Descriptions.Item label="エラーコード">{props.detail.ec}</Descriptions.Item>
        <Descriptions.Item label="店舗オーだ番号(日付)">{props.detail.sod}</Descriptions.Item>
        <Descriptions.Item label="決済金額(合計)">￥{Number(props.detail.ta).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="決済ジョブ">{props.detail.job}</Descriptions.Item>
        <Descriptions.Item label="決済オーだ番号">{props.detail.pod1}</Descriptions.Item>
        <Descriptions.Item label="ユニークキー">{props.detail.uniqueField}</Descriptions.Item>
        <Descriptions.Item label="登録日">{props.detail.createdAt}</Descriptions.Item>
        <Descriptions.Item label="更新日">{props.detail.updatedAt}</Descriptions.Item>
      </Descriptions>

      <br />
      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'center' }} >
        <Button size="large" onClick={listHandler}>
          Alipay List
        </Button>
      </div>
    </div>
  )
}

export default AlipayInfo