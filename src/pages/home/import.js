import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import {
  QUERY_FIND_ALL_IMPORT,
  QUERY_FIND_ALL_MANU,
  QUERY_FIND_ALL_MODEL,
  QUERY_FIND_ALL_STOCK,
  CREATE_IMPORT
} from './gql'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Steps,
  Select,
  Collapse,
  Typography,
  Tabs,
  Form,
  InputNumber,
  Input,
  Table,
  Modal
} from 'antd'
import {
  SnippetsOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  LeftCircleOutlined,
  CarryOutOutlined,
  IssuesCloseOutlined
} from '@ant-design/icons'
import { numberWithCommas } from '../../common'
import { Client } from '../../config'
import * as moment from 'moment'

const gridStyle = {
  width: '50%',
  padding: 10,
  cursor: 'pointer'
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}

const { Step } = Steps
const { Option } = Select
const { Panel } = Collapse
const { Title, Text } = Typography
const { TabPane } = Tabs
const initState = {
  current: 0,
  create: false,
  manuCode: undefined,
  modelCode: undefined,
  stockCode: undefined,
  newImportStocks: [],
  importStocks: []
}
const { confirm } = Modal

const Import = () => {
  const { data } = useQuery(QUERY_FIND_ALL_IMPORT, { fetchPolicy: 'no-cache' })
  const manusQuery = useQuery(QUERY_FIND_ALL_MANU, { fetchPolicy: 'no-cache' })
  const modelsQuery = useQuery(QUERY_FIND_ALL_MODEL, { fetchPolicy: 'no-cache' })
  const stocksQuery = useQuery(QUERY_FIND_ALL_STOCK, { fetchPolicy: 'no-cache' })
  const [imports, setImports] = useState([])
  const [state, setState] = useState({
    current: 0,
    create: false,
    manuCode: undefined,
    modelCode: undefined,
    stockCode: undefined,
    newImportStocks: [],
    importStocks: []
  })

  const [formAddNewStock] = Form.useForm()
  const [formAddStock] = Form.useForm()

  const manus = manusQuery.data?.findAllManu ? JSON.parse(manusQuery.data?.findAllManu) : []
  const models = modelsQuery.data?.findAllModel ? JSON.parse(modelsQuery.data?.findAllModel) : []
  const stocks = stocksQuery.data?.findAllStock ? JSON.parse(stocksQuery.data?.findAllStock) : []

  const { create, current, manuCode, modelCode, stockCode, newImportStocks, importStocks } = state

  useEffect(() => {
    if (data?.findAllImport) {
      setImports(JSON.parse(data?.findAllImport) || [])
    }
  }, [data?.findAllImport])

  const next = () => setState({ ...state, current: current + 1 })
  const prev = () => setState({ ...state, current: current - 1 })

  const setInitState = () => setState(initState)
  const onChangeManu = manuCode => setState({ ...state, manuCode })
  const onChangeImportNewStock = modelCode => setState({ ...state, modelCode })
  const onChangeImportStock = stockCode => setState({ ...state, stockCode })
  const onClickAddNewStockImport = async () => {
    await formAddNewStock.validateFields()
      .then(values => {
        setState({ ...state, newImportStocks: newImportStocks.concat({
            MaMH: { $t: modelCode },
            MaNCC: { $t: manuCode },
            ...values
          }),
          modelCode: undefined
        })
      })
  }
  const onClickAddStockImport = async () => {
    await formAddStock.validateFields()
      .then(values => {
        setState({ ...state, importStocks: importStocks.concat({
            ...stocks.find(stock => stockCode === stock.MaH['$t']),
            ...values
          }),
          stockCode: undefined
        })
      })
  }
  const verifyImport = () => {
    confirm({
      icon: <IssuesCloseOutlined />,
      content: 'Bạn chắc chắn muốn duyệt nhập hàng?',
      onOk() {
        console.log(importStocks.map(stock => ({
          MaH: { $t: stock.MaH['$t'] },
          SoLuong: { $t: stock.SoLuong['$t'] },
          GiaNhap: { $t: stock.GiaNhap['$t'] },
        })))
        console.log(newImportStocks.map(stock => ({
          MaMH: { $t: stock.MaMH['$t'] },
          MaNCC: { $t: stock.MaNCC['$t'] },
          HanSuDung: { $t: stock.HanSuDung['$t'] },
          GiaNhap: { $t: stock.GiaNhap['$t'] },
          SoLuong: { $t: stock.SoLuong['$t'] },
        })))
        Client.mutate({
          mutation: CREATE_IMPORT,
          variables: {
            imp: JSON.stringify({
              MaNCC: { $t: manuCode },
              NgayNhap: { $t: moment().format('YYYY-MM-DD') }
            }),
            stocks: JSON.stringify(importStocks.map(stock => ({
              MaH: { $t: stock.MaH['$t'] },
              SoLuong: { $t: stock.SoLuong['$t'] },
              GiaNhap: { $t: stock.GiaNhap['$t'] },
            }))),
            newStocks: JSON.stringify(newImportStocks.map(stock => ({
              MaMH: { $t: stock.MaMH['$t'] },
              MaNCC: { $t: stock.MaNCC['$t'] },
              HanSuDung: { $t: stock.HanSuDung['$t'] },
              GiaNhap: { $t: stock.GiaNhap['$t'] },
              SoLuong: { $t: stock.SoLuong['$t'] },
            })))
          }
        })
          .then(res => {
            console.log(res?.data)
          })
          .catch(error => console.log(error))
      },
      centered: true
    })
  }

  const columns = [
    {
      title: '', dataIndex: '', align: 'center',
      render: value => (
        <DeleteOutlined style={{ cursor: 'poniter', color: 'rgb(1, 21, 41)' }} onClick={() => setState({
            ...state,
            newImportStocks: newImportStocks.filter(newImportStock =>
              newImportStock.MaMH['$t'] !== value.MaMH['$t'] ||
              newImportStock.GiaNhap['$t'] !== value.GiaNhap['$t'] ||
              newImportStock.HanSuDung['$t'] !== value.HanSuDung['$t']
            ),
            importStocks: importStocks.filter(importStock =>
              importStock.MauHang.MaMH['$t'] !== value.MauHang.MaMH['$t'] ||
              importStock.GiaNhap['$t'] !== value.GiaNhap['$t'] ||
              importStock.HanSuDung['$t'] !== value.HanSuDung['$t']
            )
          })
        } />
      ),
      fixed: 'left',
      width: 30
    },
    { title: 'Tên sản phẩm', dataIndex: 'name', align: 'left', fixed: 'left' },
    { title: 'Hạn dùng', dataIndex: 'expiration', align: 'center' },
    {
      title: 'Số lượng', dataIndex: 'count', align: 'right', width: 80,
      render: value => numberWithCommas(value)
    },
    {
      title: 'Giá nhập', dataIndex: 'price', align: 'right', width: 150,
      render: value => (<strong style={{ color: '#145A32' }}>{numberWithCommas(value)}VNĐ</strong>)
    }
  ]

  const total = numberWithCommas(
    importStocks.reduce((total, i) => total + i.SoLuong['$t'] * i.GiaNhap['$t'], 0)
    + newImportStocks.reduce((total, i) => total + i.SoLuong['$t'] * i.GiaNhap['$t'], 0)
  )

  const tableStockImports = <div>
    <Table
      style={{ marginLeft: 10 }}
      columns={columns}
      dataSource={
        newImportStocks.map(newImportStock => ({
          ...newImportStock,
          name: models.find(model => model.MaMH['$t'] === newImportStock.MaMH['$t']).TenMH['$t'],
          count: newImportStock.SoLuong['$t'],
          price: newImportStock.GiaNhap['$t'],
          expiration: newImportStock.HanSuDung['$t']
        })).concat(
          importStocks.map(importStock => ({
            ...importStock,
            name: importStock.MauHang.TenMH['$t'],
            count: importStock.SoLuong['$t'],
            price: importStock.GiaNhap['$t'],
            expiration: importStock.HanSuDung['$t']
          }))
        )
      }
      pagination={{ position: ['bottomCenter'] }}
      scroll={{ y: 300, x: 500}}
      size='small'
    />
    <Text style={{ marginLeft: 10 }}>Tổng đơn hàng: <strong><Text style={{ color: '#145A32' }}>{total}VNĐ</Text></strong></Text>
  </div>

  if (create) {
    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', fontSize: 20 }}>
          <LeftCircleOutlined style={{ marginRight: 10 }} onClick={setInitState} />
          <Title mark level={4} style={{ marginBottom: 0 }}>Tạo mới đơn hàng nhập</Title>
        </div>
        <br />
        <Steps current={current} size='small' style={{ marginBottom: 5 }}>
          <Step
            title={
              manuCode && current === 1
                ? manus.find(manu => manu.MaNCC['$t'] === manuCode)?.TenNCC['$t']
                : 'Thêm nhà cung cấp'
            }
          />
          <Step title={current === 2 ? `${total}VNĐ` : 'Thêm hàng nhập'} />
          <Step title='duyệt nhập' />
        </Steps>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          {current > 0 ? (
            <Button style={{ margin: '0 8px' }} onClick={prev} icon={(<ArrowLeftOutlined />)} />
          ) : (<div />)}
          {(current === 0 && manuCode) || (current === 1 && newImportStocks.concat(importStocks)?.length) ? (
            <Button type='primary' onClick={next} icon={(<ArrowRightOutlined />)} />
          ) : (<div />)}
        </div>
        <div>
          {current === 0 && (
            <>
              <Select
                placeholder='Chọn nhà cung cấp'
                onChange={onChangeManu}
                style={{ marginBottom: 5 }}
              >
                {manus.map(manu => (
                  <Option key={manu.MaNCC['$t']} value={manu.MaNCC['$t']}><Text>{manu.TenNCC['$t']}</Text></Option>
                ))}
              </Select>
              {manuCode && (
                <div>
                  <Tag style={{ padding: 10, marginBottom: 10 }}>
                    Danh sách đơn hàng nhập của nhà cung cấp
                    <Tag color='#55acee' style={{ marginLeft: 10 }}>
                      {manus.find(manu => manu.MaNCC['$t'] === manuCode).TenNCC['$t']}
                    </Tag>
                  </Tag>
                  <Collapse
                    bordered={false}
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    className='site-collapse-custom-collapse'
                  >
                    {imports.filter(imp => imp.MaNCC['$t'] === manuCode).map(imp => (
                      <Panel
                        header={(
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>Mã đơn hàng: <strong>{ imp.MaDHN['$t'] }</strong></div>
                            <div>Ngày nhập: <strong style={{ color: 'rgb(1, 21, 41)' }}>{ imp.NgayNhap['$t'] }</strong></div>
                            <div>
                              Tổng đơn hàng: <strong style={{ color: '#145A32' }}>{ numberWithCommas(imp.Hang?.reduce((total, h) => total + h.SoLuong['$t'] * h.GiaNhap['$t'], 0)) }VNĐ</strong>
                            </div>
                          </div>
                        )}
                        key={imp.MaDHN['$t']}
                        className='site-collapse-custom-panel'
                      >
                        {imp.Hang?.map(h => (
                          <div>{ numberWithCommas(h.SoLuong['$t']) } { h.MauHang.DonVi['$t'] } { h.MauHang.TenMH['$t'] }: { numberWithCommas(h.SoLuong['$t']) } x { numberWithCommas(h.GiaNhap['$t']) } = { numberWithCommas(h.SoLuong['$t'] * h.GiaNhap['$t']) }VND</div>
                        ))}
                      </Panel>
                    ))}
                  </Collapse>
                </div>
              )}
            </>
          )}
          {current === 1 && (
            <>
            <Tabs type='card'>
              <TabPane tab='Nhập thêm hàng đã có trong kho' key='1'>
                <div className='import' style={{ display: 'flex' }}>
                  <div style={{ width: '40%' }}>
                    <Select
                      placeholder='Chọn hàng cần thêm'
                      onChange={onChangeImportStock}
                      style={{ marginBottom: 5, width: '100%' }}
                    >
                      {stocks.map(stock => (
                        <Option key={stock.MaH['$t']} value={stock.MaH['$t']}>
                          <Text style={{ color: 'rgb(166, 152, 172)' }}>{stock.MaH['$t']} - </Text>
                          <Text>
                            {stock.MauHang.TenMH['$t']}
                          </Text>
                        </Option>
                      ))}
                    </Select>
                    {stockCode && (
                      <>
                        <Text style={{ marginBottom: 3 }}>
                          <strong>Số lượng đang có trong kho: </strong>
                          <>{numberWithCommas(stocks.find(stock => stock.MaH['$t'] === stockCode).SoLuong['$t'])}</>
                          <>{stocks.find(stock => stock.MaH['$t'] === stockCode).MauHang.DonVi['$t']}</>
                        </Text><br />
                        <Text style={{ marginBottom: 3 }}><strong>Ngày hết hạn:</strong> {stocks.find(stock => stock.MaH['$t'] === stockCode).HanSuDung['$t']}</Text><br />
                        <Text style={{ marginBottom: 10 }}>
                          <strong>Đơn giá nhập: </strong>
                          <strong style={{ color: '#145A32' }}>{numberWithCommas(stocks.find(stock => stock.MaH['$t'] === stockCode).GiaNhap['$t'])}VNĐ</strong>/
                          <>{stocks.find(stock => stock.MaH['$t'] === stockCode).MauHang.DonVi['$t']}</>
                        </Text><br />
                        <Form
                          form={formAddStock}
                          name='add-stock'
                          {...layout}
                          layout='vertical'
                        >
                          <Form.Item
                            name={['SoLuong', '$t']}
                            label='Số lượng nhập'
                            rules={[{ required: true, message: 'Chưa nhập Số lượng nhập' }]}
                            style={{ marginBottom: 3 }}
                          >
                            <InputNumber style={{ width: '100%' }} />
                          </Form.Item>
                          <Button type='primary' onClick={onClickAddStockImport}>Thêm</Button>
                        </Form>
                      </>
                    )}
                  </div>
                  <div style={{ width: '60%' }}>
                    {tableStockImports}
                  </div>
                </div>
              </TabPane>
              <TabPane tab='Nhập hàng mới' key='2'>
                <div className='import' style={{ display: 'flex' }}>
                  <div style={{ width: '40%' }}>
                    <Select
                      placeholder='Chọn hàng để thêm vào đơn hàng nhập'
                      onChange={onChangeImportNewStock}
                      style={{ marginBottom: 5, width: '100%' }}
                    >
                      {models.map(model => (
                        <Option key={model.MaMH['$t']} value={model.MaMH['$t']}>
                          <Text>{model.TenMH['$t']}</Text>
                          <br />
                          <Text type='secondary'>Đơn vị: {model.DonVi['$t']}</Text>
                        </Option>
                      ))}
                    </Select>
                    {modelCode && (
                      <Form
                        form={formAddNewStock}
                        name='add-new-stock'
                        {...layout}
                        layout='vertical'
                      >
                        <Form.Item
                          name={['HanSuDung', '$t']}
                          label='Hạn sử dụng'
                          rules={[{ required: true, message: 'Chưa nhập Hạn sử dụng' }]}
                          style={{ marginBottom: 3 }}
                        >
                          <Input style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                          name={['GiaNhap', '$t']}
                          label='Giá nhập'
                          rules={[{ required: true, message: 'Chưa nhập Giá nhập' }]}
                          style={{ marginBottom: 3 }}
                        >
                          <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                          name={['SoLuong', '$t']}
                          label='Số lượng'
                          rules={[{ required: true, message: 'Chưa nhập Số lượng' }]}
                          style={{ marginBottom: 10 }}
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Button type='primary' onClick={onClickAddNewStockImport}>Thêm</Button>
                      </Form>
                    )}
                  </div>
                  <div style={{ width: '60%' }}>
                    {tableStockImports}
                  </div>
                </div>
              </TabPane>
            </Tabs>
            </>
          )}
          {current === 2 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', justifyItems: 'center' }}>
                <Text type='danger'>Sau khi duyệt đơn hàng sẽ không thể chỉnh sửa</Text>
                <div style={{ width: 'auto' }}>
                  <Button type='primary' onClick={verifyImport} icon={<CarryOutOutlined />} size='large'>
                    Duyệt đơn hàng
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </>
    )
  } else {
    return (
      <Card title={(<>
          <Tag style={{ marginLeft: 10 }} color='blue'>Đơn hàng nhập</Tag>
          <Button
            type='primary'
            icon={<SnippetsOutlined />}
            onClick={() => setState({ ...state, create: true })}
          >
            Tạo đơn hàng nhập
          </Button>
        </>
      )}>
        {imports.map(i => (
          <Card.Grid style={gridStyle} onClick={() => console.log(i)}>
            <Descriptions title={(<Tag color='#108ee9'>{i.MaDHN['$t']}</Tag>)}>
              <Descriptions.Item label='Nhà cung cấp'><Tag color='gold'>{ i.NCC.TenNCC['$t'] }</Tag></Descriptions.Item>
              <Descriptions.Item label='Ngày nhập'>{ i.NgayNhap['$t'] }</Descriptions.Item>
              {/* <Descriptions.Item label='Giảm giá'>{ i.GiamGia['$t'] }{i.KieuGiamGia['$t']}</Descriptions.Item> */}
              <Descriptions.Item label='Tổng tiền'>
                <Text style={{ color: '#145A32' }}>
                  <strong>{ numberWithCommas(i.Hang?.reduce((total, h) => total + h.SoLuong['$t'] * h.GiaNhap['$t'], 0)) }</strong>
                </Text>
                <strong>VNĐ</strong>
              </Descriptions.Item>
              {/* <Descriptions.Item label='Address' span={2}>
                No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China
              </Descriptions.Item>
              <Descriptions.Item label='Remark'>empty</Descriptions.Item> */}
            </Descriptions>
          </Card.Grid>
        ))}
      </Card>
    )
  }

}

export default Import