import Axios from 'axios'
import { useSafeState } from 'ahooks'
import { SaveOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Col, Collapse, Empty, Form, Input, Modal, Row, Space, Tag } from 'antd'

import { message } from 'App'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { isEmpty } from 'helpers/utility'

const cPanelStyles = { borderRadius: 6 }
const getCPanelClass = last => `bg-[--body-bg-color] mb-${last ? 0 : 3}`

const OrderQA = props => {
  const { order, updateOrder } = props
  const [form] = Form.useForm()
  const [updating, setUpdating] = useSafeState(false)
  const [submittingQA, setSubmittingQA] = useSafeState(false)

  const onEditFinish = async values => {
    try {
      setUpdating(true)
      const { id } = order
      const { data } = await Axios.patch(endpoints.order(id), values)
      window.log(`Update response -> `, data)
      message.success('Action successful.')
      updateOrder(data)
    } catch (error) {
      handleError(error, true)
    } finally {
      setUpdating(false)
    }
  }

  const confirmSubmitQA = () => {
    const { qa } = form.getFieldsValue(true)
    Modal.confirm({
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
                  <div className="text-sm font-medium text-gray-500">
                    Question {serial}: <div dangerouslySetInnerHTML={{ __html: x.q }} />
                  </div>
                  <div className={`mt-1 text-sm font-semibold ${x.a ? 'text-gray-500' : 'text-red-600'}`}>
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
      const postData = { qa_submitted: true, allow_qa_edit: false }
      const { data } = await Axios.patch(endpoints.order(id), postData)
      window.log(`QA submit response -> `, data)
      message.success('Action successful.')
      updateOrder(data)
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
        <Collapse defaultActiveKey={order.editor_enabled ? undefined : 'qa'}>
          <Collapse.Panel
            header={
              <>
                Questionnaire{' '}
                {order.qa_submitted ? (
                  <Tag className="ml-2" color="success">
                    Submitted
                  </Tag>
                ) : (
                  <Tag className="ml-2" color="error">
                    Not Submitted
                  </Tag>
                )}
              </>
            }
            key="qa"
            style={cPanelStyles}
            className={getCPanelClass(false)}
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
                            className="mb-3 rounded-lg border-2 border-solid border-[--body-bg-color] px-2 py-3"
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
                              <h4>{q}</h4>
                              <Form.Item
                                {...restField}
                                name={[name, 'a']}
                                rules={[{ whitespace: true, message: 'Space not allowed!' }]}
                              >
                                <Input.TextArea
                                  className="mt-2"
                                  rows={1}
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
                        htmlType="button"
                        icon={<SendOutlined />}
                        disabled={updating || disabled}
                        loading={submittingQA}
                        onClick={confirmSubmitQA}
                      >
                        Submit Questions
                      </Button>
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item noStyle>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        disabled={submittingQA || disabled}
                        loading={updating}
                      >
                        Save
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
          </Collapse.Panel>
        </Collapse>
      </Form>
    </>
  )
}

export default OrderQA
