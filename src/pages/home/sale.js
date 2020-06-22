import React, { useState, useRef } from 'react'
import { QUERY_FIND_ALL_CUS, QUERY_FIND_ALL_STOCK } from './gql'
import { Select, Typography, InputNumber, Button, Radio, List } from 'antd'
import { useQuery } from '@apollo/react-hooks'
import { numberWithCommas } from '../../common'
import {
  ImportOutlined,
  DeleteOutlined
} from '@ant-design/icons'

const { Option } = Select
const { Text } = Typography

const initState = {
  cus: undefined,
  stock: undefined,
  discountType: 'VNĐ',
  stockSales: [],
  countStock: 0,
  priceSale: 0
}

const Sale = () => {
  const [state, setState] = useState(initState)

  const { stock, discountType, stockSales, countStock, priceSale } = state

  const cussQuery = useQuery(QUERY_FIND_ALL_CUS, { fetchPolicy: 'no-cache' })
  const stocksQuery = useQuery(QUERY_FIND_ALL_STOCK, { fetchPolicy: 'no-cache' })

  const cuss = cussQuery.data?.findAllCus ? JSON.parse(cussQuery.data?.findAllCus) : []
  const stocks = stocksQuery.data?.findAllStock ? JSON.parse(stocksQuery.data?.findAllStock) : []

  const onClickAddStock = () => {
    setState({ ...state, countStock: 0, stock: undefined, stockSales: stockSales.concat({ ...stock, SoLuong: { $t: countStock }, key: stockSales.length + 1, GiaBan: { $t: priceSale } }) })
  }

  return (
    <div>
      <strong><Text style={{ marginBottom: 10 }} type='danger'>Người mua</Text></strong>
      <br />
      <Select
        placeholder='Chọn khách hàng'
        onChange={cusCode => setState({ ...state, cus: cuss.find(c => c.MaKH['$t'] === cusCode) })}
        style={{ marginBottom: 20, width: '100%' }}
      >
        {cuss.map(cus => (
          <Option key={cus.MaKH['$t']} value={cus.MaKH['$t']}>
            <Text style={{ color: 'rgb(166, 152, 172)' }}>{cus.MaKH['$t']} - </Text>
            <Text>{cus.HoTen['$t']}</Text>
            <Text style={{ color: 'rgb(166, 152, 172)' }}> - {cus.SoDienThoai['$t'] || 'chưa có số điện thoại'}</Text>
          </Option>
        ))}
      </Select>
      <strong><Text style={{ marginBottom: 10 }} type='danger'>Giảm giá đơn hàng</Text></strong><br />
      <div style={{ marginBottom: 20 }}>
        <Text style={{ color: 'rgb(1, 21, 41)', marginRight: 5 }}>Kiểu giảm giá</Text>
        <Radio.Group
          value={discountType}
          onChange={e => setState({ ...state, discountType: e.target.value })}
          style={{ marginRight: 15 }}
        >
          <Radio.Button value='VNĐ'>VNĐ</Radio.Button>
          <Radio.Button value='%'> % </Radio.Button>
        </Radio.Group>
        <Text style={{ color: 'rgb(1, 21, 41)', marginRight: 5 }}>Giá trị</Text>
        <InputNumber min={0} max={discountType === '%' ? 100 : 100000} />
      </div>
      <strong><Text style={{ marginBottom: 10 }} type='danger'>Chọn hàng thêm vào giỏ</Text></strong>
      <br />
      <div style={{ width: '100%', display: 'flex', flexDirection: 'row', padding: 20, background: '#01152959', marginBottom: 20 }}>
        <div style={{ width: '50%', marginRight: 10 }}>
          <Select
            placeholder='Chọn hàng'
            onChange={stockCode => setState({ ...state, stock: stocks.find(s => s.MaH['$t'] === stockCode) })}
            style={{ width: '100%' }}
            value={stock?.MaH['$t']}
          >
            {stocks.map(stock => (
              <Option key={stock.MaH['$t']} value={stock.MaH['$t']}>
                <Text style={{ color: 'rgb(166, 152, 172)' }}>{stock.MaH['$t']} - </Text>
                <Text>{stock.MauHang.TenMH['$t']} - </Text>
                <Text style={{ color: 'rgb(166, 152, 172)' }}>còn {numberWithCommas(stock.SoLuong['$t'])} {stock.MauHang.DonVi['$t']} trong kho</Text>
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ width: '50%' }}>
            <Text style={{ color: 'rgb(1, 21, 41)', marginRight: 5 }}>Số lượng</Text>
            <InputNumber min={0} max={parseInt(stock?.SoLuong['$t'])} disabled={!stock} style={{ marginRight: 5 }} onChange={value => setState({ ...state, countStock: value })} />
            <Text style={{ color: 'rgb(1, 21, 41)', marginRight: 5 }}>Giá bán</Text>
            <InputNumber min={0} disabled={!stock} style={{ marginRight: 5 }} onChange={value => setState({ ...state, priceSale: value })} />
            <Button
              type='primary'
              icon={<ImportOutlined />}
              size='middle'
              disabled={!stock && !countStock && !priceSale}
              onClick={onClickAddStock}
            >
              Thêm
            </Button>
        </div>
      </div>
      <strong><Text style={{ marginBottom: 10 }} type='danger'>Danh sách mặt hàng</Text></strong>
      <div style={{ padding: 10, background: '#9ca4ad' }}>
        <List
          itemLayout='horizontal'
          dataSource={stockSales}
          renderItem={item => (
            <List.Item
              actions={[
                <Button type='primary' size='large' shape='circle' icon={<DeleteOutlined />} />
              ]}
              style={{ borderBottom: '1px solid #fff' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <strong><div style={{ color: '#fff' }}>{ item.MauHang.TenMH['$t'] }</div></strong>
                <strong><div style={{ color: '#fff' }}>{ item.SoLuong['$t'] } { item.MauHang.DonVi['$t'] }</div></strong>
                <strong style={{ color: '#145A32' }}>{numberWithCommas(item.SoLuong['$t'] * item.GiaBan['$t'])}VNĐ</strong>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  )
}

export default Sale