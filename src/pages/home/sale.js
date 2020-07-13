import React, { useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { QUERY_FIND_ALL_CUS, QUERY_FIND_ALL_STOCK, QUERY_FIND_ALL_SALE, CREATE_SALE } from './gql'
import { Select, Typography, InputNumber, Button, Radio, List, notification, Modal, DatePicker, Drawer } from 'antd'
import { useQuery } from '@apollo/react-hooks'
import { numberWithCommas } from '../../common'
import {
  ImportOutlined,
  DeleteOutlined,
  CarryOutOutlined,
  IssuesCloseOutlined,
  OrderedListOutlined
} from '@ant-design/icons'
import { Client } from '../../config'

const { Option } = Select
const { Text } = Typography

const initState = {
  cus: undefined,
  stock: undefined,
  discountType: 'VNĐ',
  discountValue: 0,
  stockSales: [],
  countStock: 0,
  priceSale: 0,
  saleDate: '',
  saleDateString: undefined,
  visibleDrawer: false
}

const { confirm } = Modal

let gridApi

const Sale = () => {
  const { data, refetch } = useQuery(QUERY_FIND_ALL_SALE, { fetchPolicy: 'no-cache' })
  const realData = data?.findAllSale ? JSON.parse(data?.findAllSale) || [] : []
  const [state, setState] = useState(initState)

  const { cus, stock, discountType, stockSales, countStock, priceSale, discountValue, saleDate, visibleDrawer } = state

  const cussQuery = useQuery(QUERY_FIND_ALL_CUS, { fetchPolicy: 'no-cache' })
  const stocksQuery = useQuery(QUERY_FIND_ALL_STOCK, { fetchPolicy: 'no-cache' })

  const cuss = cussQuery.data?.findAllCus ? JSON.parse(cussQuery.data?.findAllCus) : []
  const stocks = stocksQuery.data?.findAllStock ? JSON.parse(stocksQuery.data?.findAllStock) : []

  const totalAmount = stockSales.reduce((total, stockSale) => total + stockSale.SoLuong['$t'] * stockSale.GiaBan['$t'], 0)
  const total = discountType === 'VNĐ' ? totalAmount - discountValue : totalAmount - (totalAmount / 100 * discountValue)

  const gridOptions = {
    defaultColDef: {
      resizable: true
    },
    colResizeDefault: 'shift',
    columnDefs: [
      { headerName: 'Mã đơn hàng', field: 'MaDHX.$t', cellRenderer: 'agGroupCellRenderer' },
      { headerName: 'Ngày xuất', field: 'NgayXuat.$t' },
      { headerName: 'Khách hàng', field: 'KhachHang.HoTen.$t' },
      {
        headerName: 'Giảm giá',
        valueGetter: param => {
          return `${numberWithCommas(param.data.GiamGia['$t'])}${param.data.KieuGiamGia['$t']}`
        }
      },
      {
        headerName: 'Tổng đơn hàng',
        valueGetter: param => {
          const totalDoc = param.data?.Hang?.reduce((total, h) => total + parseFloat(h.SoLuong['$t']) * parseFloat(h.GiaBan['$t']), 0)
          const totalHasDiscount = param.data.KieuGiamGia['$t'] === '%' ? totalDoc - (totalDoc * parseFloat(param.data.GiamGia['$t']) / 100) : totalDoc - parseFloat(param.data.GiamGia['$t'])
          return numberWithCommas(totalHasDiscount)
        }
      }
    ],
    onGridReady: params => {
      gridApi = params.api
      gridApi.sizeColumnsToFit()
    }
  }

  const detailCellRendererParams = {
    detailGridOptions: {
      pagination: true,
      paginationAutoPageSize: true,
      columnDefs: [
        { headerName: 'Mã hàng', field: 'MaH.$t' },
        { headerName: 'Tên mặt hàng', field: 'MauHang.TenMH.$t' },
        {
          headerName: 'Số lượng',
          valueGetter: param => {
            return `${numberWithCommas(param.data.SoLuong['$t'])}${param.data.MauHang.DonVi['$t']}`
          }
        },
        {
          headerName: 'Giá bán',
          valueGetter: param => {
            return numberWithCommas(param.data.GiaBan['$t'])
          }
        },
        {
          headerName: 'Tổng tiền',
          valueGetter: param => {
            return numberWithCommas(parseFloat(param.data.SoLuong['$t']) * parseFloat(param.data.GiaBan['$t']))
          }
        }
      ],
      defaultColDef: {
        sortable: true,
        flex: 1,
      },
    },
    getDetailRowData: params => {
      params.successCallback(params.data.Hang);
    },
  }

  const onClickAddStock = () => {
    setState({ ...state, countStock: 0, stock: undefined, stockSales: stockSales.concat({ ...stock, SoLuong: { $t: countStock }, key: stockSales.length + 1, GiaBan: { $t: priceSale } }) })
  }

  const onChangeDiscount = value => {
    setState({ ...state, discountValue: value })
  }

  const onClickDeleteStockSale = index => {
    setState({ ...state, stock: undefined, stockSales: stockSales.filter((_, idx) => idx !== index) })
  }

  const verifySale = () => {
    const { cus, discountType, stockSales, saleDateString } = state
    console.log(state)
    Client.mutate({
      mutation: CREATE_SALE,
      variables: {
        sale: JSON.stringify({
          MaKH: cus.MaKH,
          NgayXuat: { $t: saleDateString },
          KieuGiamGia: { $t: discountType },
          GiamGia: { $t: discountValue }
        }),
        stocks: JSON.stringify(stockSales.map(stock => ({
          MaH: { $t: stock.MaH['$t'] },
          SoLuong: { $t: stock.SoLuong['$t'] },
          GiaBan: { $t: stock.GiaBan['$t'] },
        })))
      }
    })
      .then(res => {
        if (res?.data) {
          notification.open({
            type: 'info',
            message: 'Duyệt đơn hàng thành công!',
            placement: 'bottomLeft'
          })
        }
        setState(initState)
      })
      .catch(error => console.log(error))
  }

  const onClickVerify = () => {
    if (!cus) {
      notification.open({
        placement: 'bottomLeft',
        type: 'error',
        message: 'Người mua chưa được chọn!',
      })
    } else if (!stockSales?.length) {
      notification.open({
        placement: 'bottomLeft',
        type: 'error',
        message: 'Đơn hàng chưa có giá trị!',
      })
    } else if (total < 0) {
      notification.open({
        placement: 'bottomLeft',
        type: 'error',
        message: 'Giá trị đơn hàng phải lớn hơn 0!',
      })
    } else if (!saleDate) {
      notification.open({
        placement: 'bottomLeft',
        type: 'error',
        message: 'Chưa chọn ngày bán!',
      })
    } else {
      confirm({
        title: 'Bạn chắc chắn muốn duyệt?',
        icon: <IssuesCloseOutlined />,
        content: 'Sau khi duyệt sẽ không thể chỉnh sửa',
        onOk: verifySale,
        centered: true
      })
    }
  }

  const onChangeSaleDate = (value, valueString) => setState({ ...state, saleDate: value, saleDateString: valueString })

  const openDrawer = () => setState({ ...state, visibleDrawer: true })
  const closeDrawer = () => setState({ ...state, visibleDrawer: false })

  return (
    <div>
      <Button type='primary' onClick={openDrawer} icon={<OrderedListOutlined />} size='large' style={{ marginBottom: 10 }}>Danh sách đơn hàng xuất</Button>
      <br />
      <strong><Text style={{ marginBottom: 10 }} type='danger'>Người mua</Text></strong>
      <br />
      <Select
        placeholder='Chọn khách hàng'
        onChange={cusCode => setState({ ...state, cus: cuss.find(c => c.MaKH['$t'] === cusCode) })}
        style={{ marginBottom: 20, width: '100%' }}
      >
        {cuss?.map(cus => (
          <Option key={cus.MaKH['$t']} value={cus.MaKH['$t']}>
            <Text style={{ color: 'rgb(166, 152, 172)' }}>{cus.MaKH['$t']} - </Text>
            <Text>{cus.HoTen['$t']}</Text>
            <Text style={{ color: 'rgb(166, 152, 172)' }}> - {cus.SoDienThoai['$t'] || 'chưa có số điện thoại'}</Text>
          </Option>
        ))}
      </Select>
      <strong><Text style={{ marginBottom: 10 }} type='danger'>Ngày bán</Text></strong>
      <br />
      <DatePicker style={{ marginBottom: 20 }} placeholder='Chọn ngày bán' onChange={onChangeSaleDate} value={saleDate} />
      <br />
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
        <InputNumber min={0} max={discountType === '%' ? 100 : 100000} onChange={onChangeDiscount} value={discountValue} />
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
              disabled={!stock || !countStock || !priceSale}
              onClick={onClickAddStock}
            >
              Thêm
            </Button>
        </div>
      </div>
      <strong><Text style={{ marginBottom: 10 }} type='danger'>Tổng đơn hàng: <strong style={{ color: '#145A32' }}>{numberWithCommas(total)}VNĐ</strong></Text></strong>
      <Button type='primary' onClick={onClickVerify} icon={<CarryOutOutlined />} size='large' style={{ marginLeft: 20 }}>Duyệt đơn hàng</Button>
      <br />
      <strong><Text style={{ marginBottom: 10 }} type='danger'>Danh sách mặt hàng</Text></strong>
      <div style={{ padding: 10, background: '#9ca4ad' }}>
        <List
          itemLayout='horizontal'
          dataSource={stockSales}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Button type='primary' size='large' shape='circle' icon={<DeleteOutlined />} onClick={() => onClickDeleteStockSale(index)} />
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
      <Drawer
        title='Danh sách đơn hàng xuất'
        width='80vw'
        visible={visibleDrawer}
        onClose={closeDrawer}
        closable
        className='ag-theme-alpine'
      >
        <AgGridReact
          { ...gridOptions }
          rowData={realData}
          suppressAutoSize
          masterDetail
          detailCellRendererParams={detailCellRendererParams}
        />
      </Drawer>
    </div>
  )
}

export default Sale