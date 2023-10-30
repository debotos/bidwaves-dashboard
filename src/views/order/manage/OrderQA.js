import Axios from 'axios'
import { useSafeState } from 'ahooks'
import { Button, Col, Empty, Form, Input, Modal, Row, Space } from 'antd'
import { SendOutlined } from '@ant-design/icons'

import { message } from 'App'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { isEmpty } from 'helpers/utility'

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
      // const isSubmitAction = !!document.querySelector('.review-modal')
      // !isSubmitAction && message.success('Save successful.')
      updateOrder(data)
    } catch (error) {
      handleError(error, true)
    } finally {
      setUpdating(false)
    }
  }

  const confirmSubmitQA = () => {
    form.submit()
    const { qa } = form.getFieldsValue(true)
    Modal.confirm({
      className: 'review-modal',
      maskClosable: true,
      closable: true,
      title: 'Please review your answers',
      content: isEmpty(qa) ? (
        <Empty />
      ) : (
        <>
          <Space direction="vertical" className="w-100 my-2">
            {qa.map((x, i) => {
              const serial = i + 1
              return (
                <div key={i} className="rounded bg-gray-100 px-3 py-2">
                  <div className="text-xs font-medium text-gray-500">
                    Question {serial}: <div dangerouslySetInnerHTML={{ __html: x.q }} />
                  </div>
                  <div className={`mt-1 text-xs font-semibold ${x.a ? 'text-gray-600' : 'text-red-600'}`}>
                    Answer {serial}: <div dangerouslySetInnerHTML={{ __html: x.a ?? 'Not answered.' }} />
                  </div>
                </div>
              )
            })}
          </Space>
        </>
      ),
      okText: 'Submit',
      cancelText: 'Back To Edit',
      onOk: handleSubmitQA
    })
  }

  const handleSubmitQA = async () => {
    try {
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
                    onClick={confirmSubmitQA}
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
