import React, { useImperativeHandle } from 'react'
import { Form, Input, notification } from 'antd'
import { Client } from '../../config'
import { MUTATION_UPDATE_USER } from './gql'

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}

const EditInfo = React.forwardRef((props, ref) => {
  const [form] = Form.useForm()
  const { nguoiDung, updateUser } = props

  const save = () => {
    form.validateFields()
      .then(values => {
        const input = JSON.stringify({
          ...nguoiDung,
          ...values
        })
        console.log(input)
        Client.mutate({
          mutation: MUTATION_UPDATE_USER,
          variables: {
            input
          }
        })
          .then(({ data }) => {
            updateUser()
            notification.open({
              message: data?.updateUser,
            })
          })
      })
  }

  useImperativeHandle(ref, () => ({
    save
  }))

  return (
    <Form form={form} {...layout} name="edit-info" initialValues={nguoiDung}>
      <Form.Item name={['HoTen', '$t']} label="Họ tên" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name={['SDT', '$t']} label="Số điện thoại">
        <Input />
      </Form.Item>
      <Form.Item name={['DiaChi', '$t']} label="Địa chỉ">
        <Input />
      </Form.Item>
    </Form>
  )
})

export default EditInfo
