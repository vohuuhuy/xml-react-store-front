import React, { useState } from 'react'
import * as Icon from '@ant-design/icons'
import { AgGridReact } from 'ag-grid-react'
import { Modal, Button, Form, Input, notification } from 'antd'
import { QUERY_FIND_ALL_MODEL, MUTATION_ADD_MODEL, MUTATION_UPDATE_MODEL, MUTATION_DELETE_MODELS } from './gql'
import { Client } from '../../config'
import { useQuery } from '@apollo/react-hooks'

let gridApi
const { confirm } = Modal

const Model = () => {
  const { data, refetch } = useQuery(QUERY_FIND_ALL_MODEL, { fetchPolicy: 'no-cache' })
  const [visible, setVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  const realData = data?.findAllModel ? JSON.parse(data?.findAllModel) || [] : []

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
    const Mas = gridApi.getSelectedRows().map(row => row.MaMH['$t']) || []
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
          mutation: MUTATION_DELETE_MODELS,
          variables: { Mas }
        })
          .then(({ data }) => {
            notification.open({
              message: data?.deleteModels,
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
            mutation: MUTATION_UPDATE_MODEL,
            variables: {
              input
            }
          })
            .then(({ data }) => {
              notification.open({
                message: data?.updateModel,
              })
            })
        } else {
          Client.mutate({
            mutation: MUTATION_ADD_MODEL,
            variables: {
              input
            }
          })
            .then(({ data }) => {
              notification.open({
                message: data?.addModel,
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
      { headerName: 'Mã mẫu hàng', field: 'MaMH.$t' },
      { headerName: 'Tên mẫu hàng', field: 'TenMH.$t' },
      { headerName: 'Đơn vị', field: 'DonVi.$t' }
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
        title={`${isEdit ? 'Chỉnh sửa' : 'Thêm'} mẫu hàng`}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          name='add-Model'
          initialValues={{
            GioiTinh: { '$t': 'male' }
          }}
          layout='vertical'
        >
          { isEdit &&
            <Form.Item name={['MaMH', '$t']}>
              <Input disabled  />
            </Form.Item>
          }
          <Form.Item name={['TenMH', '$t']} label='Tên mẫu hàng' rules={[{ required: true, message: 'Chưa nhập Tên mẫu hàng' }]}>
            <Input />
          </Form.Item>
          <Form.Item name={['DonVi', '$t']} label='Đơn vị'>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Model
