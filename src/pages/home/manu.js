import React, { useState } from 'react'
import * as Icon from '@ant-design/icons'
import { AgGridReact } from 'ag-grid-react'
import { Modal, Button, Form, Input, notification } from 'antd'
import { QUERY_FIND_ALL_MANU, MUTATION_ADD_MANU, MUTATION_UPDATE_MANU, MUTATION_DELETE_MANUS } from './gql'
import { Client } from '../../config'
import { useQuery } from '@apollo/react-hooks'

let gridApi
const { confirm } = Modal

const Manu = () => {
  const { data, refetch } = useQuery(QUERY_FIND_ALL_MANU, { fetchPolicy: 'no-cache' })
  const [visible, setVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  const realData = data?.findAllManu ? JSON.parse(data?.findAllManu) || [] : []

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
    const Mas = gridApi.getSelectedRows().map(row => row.MaNCC['$t']) || []
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
          mutation: MUTATION_DELETE_MANUS,
          variables: { Mas }
        })
          .then(({ data }) => {
            notification.open({
              message: data?.deleteManus,
            })
            refetch()
          })
      }
    })
  }

  const handleOk = async () => {
    await form.validateFields()
      .then(values => {
        const input = JSON.stringify(values)
        if (isEdit) {
          Client.mutate({
            mutation: MUTATION_UPDATE_MANU,
            variables: {
              input
            }
          })
            .then(({ data }) => {
              notification.open({
                message: data?.updateManu,
              })
            })
        } else {
          Client.mutate({
            mutation: MUTATION_ADD_MANU,
            variables: {
              input
            }
          })
            .then(({ data }) => {
              notification.open({
                message: data?.addManu,
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
      { headerName: 'Mã nhà cung cấp', field: 'MaNCC.$t' },
      { headerName: 'Tên nhà cung cấp', field: 'TenNCC.$t' },
      { headerName: 'Quốc gia', field: 'QuocGia.$t' },
      { headerName: 'Số điện thoại', field: 'SDT.$t' }
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
        title={`${isEdit ? 'Chỉnh sửa' : 'Thêm'} nhà cung cấp`}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          name="add-Manu"
          initialValues={{
            QuocGia: { '$t': 'Việt Nam' }
          }}
          layout='vertical'
        >
          { isEdit &&
            <Form.Item name={['MaNCC', '$t']}>
              <Input disabled  />
            </Form.Item>
          }
          <Form.Item name={['TenNCC', '$t']} label="Tên nhà cung cấp" rules={[{ required: true, message: 'Chưa nhập Tên nhà cung cấp' }]}>
            <Input />
          </Form.Item>
          <Form.Item name={['QuocGia', '$t']} label="Quốc gia">
            <Input />
          </Form.Item>
          <Form.Item name={['SDT', '$t']} label="Số điện thoại">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Manu
