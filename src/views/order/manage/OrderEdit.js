import Axios from 'axios'
import { useSafeState } from 'ahooks'
import { SaveOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Col, Form, Input, Modal, Row } from 'antd'

import { message } from 'App'
import keys from 'config/keys'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import TextEditor from 'components/micro/fields/TextEditor'

const OrderEdit = props => {
  const { order, closeUI } = props
  const [form] = Form.useForm()
  const [updating, setUpdating] = useSafeState(false)

  const onEditFinish = async values => {
    try {
      setUpdating(true)
      const { id } = order
      const { data } = await Axios.patch(endpoints.order(id), values)
      window.log(`Update response -> `, data)
      message.success('Action successful.')
    } catch (error) {
      handleError(error, true)
    } finally {
      setUpdating(false)
    }
  }

  const handleFinalSubmit = () => {
    Modal.info({
      closable: true,
      maskClosable: true,
      title: 'Final Submission?',
      content: (
        <div>
          You are about to submit the final piece. Once you click confirm, you can not amend this as will be published.
        </div>
      ),
      okText: 'Submit',
      onOk() {
        onEditFinish({ status: keys.ORDER_STATUS.READY })
          .then(() => {
            closeUI?.()
          })
          .catch(err => console.log('Error: ', err))
      }
    })
  }

  if (!order) return null

  return (
    <>
      {/* <div dangerouslySetInnerHTML={{ __html: order.content }} /> */}
      <Form form={form} layout="vertical" initialValues={{ ...order }} onFinish={onEditFinish}>
        <Form.Item label="Title" name="title" rules={[{ required: true, whitespace: true, message: 'Provide title!' }]}>
          <Input allowClear placeholder="Title" />
        </Form.Item>

        <Form.Item label="Content" name="content" rules={[{ whitespace: true, message: 'Provide content!' }]}>
          <TextEditor id={`order-content`} placeholder="Content" simple={false} />
        </Form.Item>

        <Row justify="space-between" align="middle" className="mt-4" gutter={[10, 0]} wrap={false}>
          <Col>
            {/* <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Select status!' }]}>
              <Select
                placeholder="Order status"
                style={{ width: 170 }}
                options={Object.values(keys.ORDER_STATUS).map(x => ({ value: x, label: x }))}
              />
            </Form.Item> */}
            {order.title && order.content && (
              <Button
                type="dashed"
                htmlType="button"
                icon={<SendOutlined rotate={-40} />}
                disabled={updating}
                onClick={handleFinalSubmit}
              >
                Final Submit
              </Button>
            )}
          </Col>
          <Col>
            <Form.Item noStyle>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updating}>
                Save
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default OrderEdit
