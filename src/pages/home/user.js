import React, { useState, useContext } from 'react'
import * as Icon from '@ant-design/icons'
import { AgGridReact } from 'ag-grid-react'
import { Modal, Button, Form, Input, Radio, notification } from 'antd'
import { QUERY_FIND_ALL_USER, MUTATION_ADD_USER, MUTATION_UPDATE_USER, MUTATION_DELETE_USERS } from './gql'
import { Client } from '../../config'
import { useQuery } from '@apollo/react-hooks'
import { Appcontext } from '../../App'

let gridApi
const { confirm } = Modal

const User = props => {
  const { data, refetch } = useQuery(QUERY_FIND_ALL_USER, { fetchPolicy: 'network-only' })
  const [visible, setVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  const appContext = useContext(Appcontext)

  const realData = data?.findAllUser ? JSON.parse(data?.findAllUser) || [] : []

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
      console.log(selectedRows)
      form.setFieldsValue(selectedRows[0])
    } else {
      form.resetFields()
    }
    setIsEdit(edit)
    setVisible(true)
  }

  const showModalDelete = () => {
    const TaiKhoans = gridApi.getSelectedRows().map(row => row.TaiKhoan['$t']) || []
    if (TaiKhoans.length === 0) {
      notification.open({
        type: 'warning',
        message: 'Chọn ít nhất 1 để xóa',
      })
      return
    }
    if (TaiKhoans.includes(appContext?.NguoiDung?.TaiKhoan['$t'])) {
      notification.open({
        type: 'warning',
        message: 'Tài khoản đang được dùng',
      })
      return
    }
    confirm({
      icon: <Icon.DeleteOutlined />,
      content: 'Xác nhận xóa',
      onOk() {
        Client.mutate({
          mutation: MUTATION_DELETE_USERS,
          variables: { TaiKhoans }
        })
          .then(({ data }) => {
            notification.open({
              message: data?.deleteUsers,
            })
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
            mutation: MUTATION_UPDATE_USER,
            variables: {
              input
            }
          })
            .then(({ data }) => {
              if (appContext?.NguoiDung?.TaiKhoan['$t'] === values.TaiKhoan['$t']) {
                props.updateUser()
              }
              notification.open({
                message: data?.updateUser,
              })
            })
        } else {
          Client.mutate({
            mutation: MUTATION_ADD_USER,
            variables: {
              input
            }
          })
            .then(({ data }) => {
              notification.open({
                message: data?.addUser,
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
      { headerName: 'Mã', field: 'MaND.$t' },
      { headerName: 'Họ tên', field: 'HoTen.$t' },
      { headerName: 'Tài khoản', field: 'TaiKhoan.$t' },
      {
        headerName: 'Chức vụ',
        field: 'ChucVu.$t',
        valueFormatter: i => i.value === 'QUAN_LY' ? 'Quản lý' : 'Nhân Viên'
      },
      { headerName: 'Số điện thoại', field: 'SDT.$t' },
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
        title="Thêm người dùng"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          name="add-user"
          initialValues={{
            ChucVu: { '$t': 'NHAN_VIEN' },
            GioiTinh: { '$t': 'male' }
          }}
          layout='vertical'
        >
          <Form.Item name={['HoTen', '$t']} label="Họ tên" rules={[{ required: true, message: 'Chưa nhập Họ tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name={['TaiKhoan', '$t']} label="Tài khoản" rules={[{ required: true, message: 'Chưa nhập tài khoản' }]}>
            <Input disabled={isEdit} />
          </Form.Item>
          { !isEdit && (
              <>
                <Form.Item name={['MatKhau', '$t']} label="Mật khẩu" rules={[{ required: true, message: 'Chưa nhập mật khẩu' }]}>
                  <Input.Password />
                </Form.Item>
                <Form.Item name={['ChucVu', '$t']} label="Chức vụ" rules={[{ required: true, message: 'Chưa chọn chức vụ' }]} className="collection-create-form_last-form-item">
                  <Radio.Group>
                    <Radio value="NHAN_VIEN">Nhân viên</Radio>
                    <Radio value="QUAN_LY">Quản lý</Radio>
                  </Radio.Group>
                </Form.Item>
              </>
            )
          }
          <Form.Item name={['SDT', '$t']} label="Số điện thoại">
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

export default User
