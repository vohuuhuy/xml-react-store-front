import React, { useState } from 'react'
import * as Icon from '@ant-design/icons'
import { AgGridReact } from 'ag-grid-react'
import { Modal, Button, Form, Input, notification, Radio } from 'antd'
import { QUERY_FIND_ALL_CUS, MUTATION_ADD_CUS, MUTATION_UPDATE_CUS, MUTATION_DELETE_CUSS } from './gql'
import { Client } from '../../config'
import { useQuery } from '@apollo/react-hooks'

let gridApi
const { confirm } = Modal

const Cus = () => {
  const { data, refetch } = useQuery(QUERY_FIND_ALL_CUS, { fetchPolicy: 'no-cache' })
  const [visible, setVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  const realData = data?.findAllCus ? JSON.parse(data?.findAllCus) || [] : []

  const [form] = Form.useForm()

  const showModal = (edit = false) => {
    if (edit) {
      const selectedRows = gridApi.getSelectedRows()
      if (selectedRows.length > 1 || selectedRows.length === 0) {
        notification.open({
          type: 'warning',
          message: 'Chọn 1 để chỉnh sửa',
        })
        return
      }
      form.setFieldsValue(selectedRows[0])
    } else {
      form.resetFields()
    }
    setIsEdit(edit)
    setVisible(true)
  }

  const showModalDelete = () => {
    const Mas = gridApi.getSelectedRows().map(row => row.MaKH['$t']) || []
    if (Mas.length === 0) {
      notification.open({
        type: 'warning',
        message: 'Chọn ít nhất 1 để xóa',
      })
      return
    }
    confirm({
      icon: <Icon.DeleteOutlined />,
      content: 'Xác nhận xóa',
      onOk() {
        Client.mutate({
          mutation: MUTATION_DELETE_CUSS,
          variables: { Mas }
        })
          .then(({ data }) => {
            notification.open({
              message: data?.deleteCuss,
            })
            refetch()
          })
      }
    });
  }

  const handleOk = async () => {
    await form.validateFields()
      .then(values => {
        const input = JSON.stringify(values)
        if (isEdit) {
          Client.mutate({
            mutation: MUTATION_UPDATE_CUS,
            variables: {
              input
            }
          })
            .then(({ data }) => {
              notification.open({
                message: data?.updateCus,
              })
            })
        } else {
          Client.mutate({
            mutation: MUTATION_ADD_CUS,
            variables: {
              input
            }
          })
            .then(({ data }) => {
              notification.open({
                message: data?.addCus,
              })
            })
        }
        refetch()
      })
    handleCancel()
  }

  const handleCancel = () => setVisible(false)

  const isFirstColumn = params => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;
  }

  const gridOptions = {
    defaultColDef: {
      resizable: true,
      headerCheckboxSelection: isFirstColumn,
      checkboxSelection: isFirstColumn,
    },
    colResizeDefault: 'shift',
    rowSelection: 'multiple',
    columnDefs: [
      { headerName: 'Mã khách hàng', field: 'MaKH.$t' },
      { headerName: 'Tên khách hàng', field: 'HoTen.$t' },
      { headerName: 'Email', field: 'Email.$t' },
      { headerName: 'Số điện thoại', field: 'SoDienThoai.$t' },
      { headerName: 'Ngày sinh', field: 'NgaySinh.$t' },
      { headerName: 'Địa chỉ', field: 'DiaChi.$t' }
    ],
    onGridReady: params => {
      gridApi = params.api
    }
  }

  return (
    <div>
      <div>
        <Button shape='circle' icon={<Icon.PlusSquareOutlined />} onClick={() => showModal()} />
        <Button shape='circle' icon={<Icon.EditOutlined />} onClick={() => showModal(true)} />
        <Button shape='circle' icon={<Icon.DeleteOutlined />} onClick={showModalDelete} />
      </div>
      <div className='ag-theme-alpine' style={ {height: 300, width: '100%'} }>
        <AgGridReact
          { ...gridOptions }
          rowData={realData}
        />
      </div>
      <Modal
        title={`${isEdit ? 'Chỉnh sửa' : 'Thêm'} khách hàng`}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          name='add-Cus'
          initialValues={{
            GioiTinh: { '$t': 'male' }
          }}
          layout='vertical'
        >
          { isEdit &&
            <Form.Item name={['MaKH', '$t']}>
              <Input disabled  />
            </Form.Item>
          }
          <Form.Item name={['HoTen', '$t']} label='Tên khách hàng' rules={[{ required: true, message: 'Chưa nhập Tên khách hàng' }]}>
            <Input />
          </Form.Item>
          <Form.Item name={['Email', '$t']} label='Email'>
            <Input />
          </Form.Item>
          <Form.Item name={['SoDienThoai', '$t']} label='Số điện thoại'>
            <Input />
          </Form.Item>
          <Form.Item name={['NgaySinh', '$t']} label='Ngày sinh'>
            <Input />
          </Form.Item>
          <Form.Item name={['GioiTinh', '$t']} label="Giới tính" className="collection-create-form_last-form-item">
            <Radio.Group>
              <Radio value="male">Nam</Radio>
              <Radio value="feemale">Nữ</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name={['DiaChi', '$t']} label="Địa chỉ">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Cus
