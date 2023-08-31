import Axios from 'axios'
import React, { useState, useRef, useEffect } from 'react'
import { PlusOutlined, SaveOutlined } from '@ant-design/icons'
import { Row, Button, Form, Modal, Input } from 'antd'

import { message } from 'App'
import handleError from 'helpers/handleError'
import TextEditor from 'components/micro/fields/TextEditor'

export const getFormContent = ({ loading, isAdd = false }) => {
  return (
    <>
      <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Provide title!' }]}>
        <Input allowClear placeholder="Title" />
      </Form.Item>
      <Form.Item label="Content" name="content" rules={[{ whitespace: true, message: 'Provide content!' }]}>
        <TextEditor id={`note-content-${isAdd ? 'add' : 'edit'}`} placeholder="Note Content" simple={true} />
      </Form.Item>
      <Row justify="end" className="mt-4">
        <Form.Item noStyle>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            Save
          </Button>
        </Form.Item>
      </Row>
    </>
  )
}

function AddComponent(props) {
  const [form] = Form.useForm()
  const _isMounted = useRef(false)
  const [loading, setLoading] = useState(false)
  const [addModal, setAddModal] = useState(false)

  useEffect(() => {
    _isMounted.current = true
    return () => {
      _isMounted.current = false
    }
  }, [])

  const onFinish = async values => {
    try {
      _isMounted.current && setLoading(true)
      const { data } = await Axios.post(props.ep, values)
      window.log(`Add response -> `, data)
      message.success('Action successful!')
      props.onFinish?.(data)
      form.resetFields()
      _isMounted.current && setAddModal(false)
    } catch (error) {
      handleError(error, true)
    } finally {
      _isMounted.current && setLoading(false)
    }
  }

  return (
    <>
      <Button size="small" icon={<PlusOutlined />} onClick={() => setAddModal(true)} />

      <Modal
        title="Add Note"
        open={addModal}
        footer={null}
        onCancel={() => setAddModal(false)}
        className="ant-modal-width-mid"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {getFormContent({ loading, isAdd: true })}
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(AddComponent)
