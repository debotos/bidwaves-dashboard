import Axios from 'axios'
import { useSafeState } from 'ahooks'
import { SendOutlined } from '@ant-design/icons'
import { Button, Col, Empty, Form, Input, Row } from 'antd'

import { message } from 'App'
import endpoints from 'config/endpoints'
import { isEmpty } from 'helpers/utility'
import handleError from 'helpers/handleError'

const OrderQA = props => {
  const { order, updateOrder, closeModal } = props

  const [form] = Form.useForm()
  const [updating, setUpdating] = useSafeState(false)
  const [submittingQA, setSubmittingQA] = useSafeState(false)

  const onEditFinish = async values => {
    try {
      setUpdating(true)
      const { id } = order
      const { data } = await Axios.patch(endpoints.order(id), values)
      window.log(`Update response -> `, data)
      updateOrder(data)
    } catch (error) {
      handleError(error, true)
    } finally {
      setUpdating(false)
    }
  }

  const handleSubmit = async () => {
    try {
      form.submit()
      setSubmittingQA(true)
      const { id } = order
      const postData = { qa_submitted: true }
      const { data } = await Axios.patch(endpoints.order(id), postData)
      window.log(`QA/Brief submit response -> `, data)
      message.success('Submit successful. Please wait until BidWaves review the answers.')
      updateOrder(data)
      closeModal?.()
    } catch (error) {
      handleError(error, true)
    } finally {
      setSubmittingQA(false)
    }
  }

  if (!order) return null

  const disabled = !order.allow_qa_edit

  return (
    <>
      <Form
        className="mt-2"
        form={form}
        disabled={disabled}
        layout="vertical"
        initialValues={{ ...order }}
        onFinish={onEditFinish}
      >
        {isEmpty(order.qa) ? (
          <Empty description="No Questions" />
        ) : (
          <>
            <Form.List name="qa">
              {fields => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => {
                    const q = order.qa[index].q
                    return (
                      <Row
                        key={key}
                        align="middle"
                        className="mb-3 rounded-lg border-2 border-solid border-[--body-bg-color] px-2 py-2"
                        wrap={false}
                        gutter={[10, 0]}
                      >
                        <Col flex={1}>
                          <Form.Item
                            {...restField}
                            name={[name, 'q']}
                            rules={[{ whitespace: true, message: 'Space not allowed!' }]}
                            noStyle
                          >
                            <Input.TextArea
                              readOnly={true}
                              disabled={true}
                              hidden={true}
                              style={{ height: 0, width: 0, opacity: 0 }}
                              className="pointer-events-none"
                              rows={1}
                              allowClear
                              maxLength={500}
                              showCount
                              placeholder="Question"
                            />
                          </Form.Item>
                          <h4 className="font-semibold">{q}</h4>
                          <Form.Item
                            {...restField}
                            name={[name, 'a']}
                            rules={[{ whitespace: true, message: 'Space not allowed!' }]}
                          >
                            <Input.TextArea
                              className="mt-2"
                              rows={2}
                              allowClear
                              maxLength={1000}
                              showCount
                              placeholder="Answer"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    )
                  })}
                </>
              )}
            </Form.List>

            <Row justify="end" align="middle" className="mt-4" gutter={[10, 0]} wrap={false}>
              <Col>
                <Form.Item noStyle>
                  <Button
                    type="primary"
                    shape="round"
                    htmlType="button"
                    icon={<SendOutlined />}
                    disabled={updating || disabled}
                    loading={submittingQA}
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
      </Form>
    </>
  )
}

export default OrderQA
