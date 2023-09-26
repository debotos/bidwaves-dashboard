import React from 'react'
import { useSafeState } from 'ahooks'
import { Alert, Button, Col, Form, Input, Row, Tooltip, message } from 'antd'
import { SendOutlined } from '@ant-design/icons'

import { getCssVar, isEmpty } from 'helpers/utility'
import { CalenderLink } from 'components/micro/Common'
import { BsCheckCircleFill } from 'react-icons/bs'

function Website(props) {
  const [form] = Form.useForm()
  const { product, asyncUpdateProduct } = props
  const { data_obj } = product || {}
  const { qa } = data_obj || {}
  const [loading, setLoading] = useSafeState(false)
  const [saving, setSaving] = useSafeState(false)

  const handleSave = async values => {
    try {
      setSaving(true)
      await asyncUpdateProduct(product.id, { data_obj: { ...data_obj, ...values } })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await asyncUpdateProduct(product.id, { submitted: true })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(data_obj.script ?? '')
      message.success('Copied to the clipboard.')
    } catch (error) {
      console.error('Error copying script:', error)
      message.error('Failed to copy to the clipboard.')
    }
  }

  return (
    <>
      <p dangerouslySetInnerHTML={{ __html: data_obj.instruction_text }} />

      {data_obj.cms_comment && <Alert className="my-3" message={data_obj.cms_comment} type="info" showIcon />}

      {!isEmpty(qa) && (
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={product.data_obj ?? {}}>
          <Form.List name="qa">
            {fields => (
              <>
                {fields.map(({ key, name, ...restField }, index) => {
                  const item = qa[index]
                  const isPreview = !!item.preview
                  const isApproved = !!item.approved
                  const cClassName = `mb-3 ${index === 0 ? 'mt-4' : ''}`

                  return (
                    <React.Fragment key={key}>
                      {isPreview && item.a && (
                        <div className={cClassName} key={index + '-preview'}>
                          <Row
                            align="middle"
                            className="relative whitespace-pre-wrap rounded-lg border border-solid border-[--body-bg-color] bg-[--body-bg-color] px-4 py-3"
                          >
                            <Col flex={1}>
                              <p className="m-0 font-semibold" dangerouslySetInnerHTML={{ __html: item.a }} />
                            </Col>
                            {item.copyable && (
                              <Button onClick={handleCopyClick} type="dashed" size="small" className="z-10">
                                Copy
                              </Button>
                            )}
                          </Row>
                        </div>
                      )}
                      <Row
                        key={key}
                        align="middle"
                        className={
                          isPreview
                            ? `h-0 opacity-0`
                            : `rounded-lg border-2 border-solid border-[--body-bg-color] px-2 py-3 ${cClassName}`
                        }
                        wrap={false}
                        gutter={[10, 0]}
                      >
                        <Col flex={1}>
                          <Form.Item
                            {...restField}
                            noStyle
                            name={[name, 'q']}
                            rules={[{ whitespace: true, message: 'Space not allowed!' }]}
                          >
                            <Input.TextArea
                              readOnly={true}
                              disabled={true}
                              hidden={true}
                              className="pointer-events-none h-0 w-0 opacity-0"
                              rows={1}
                              allowClear
                              maxLength={500}
                              showCount
                              placeholder="Question"
                            />
                          </Form.Item>
                          {!isPreview && (
                            <Row align={`middle`} gutter={[6, 0]} wrap={false}>
                              <Col>
                                <h4 className="align-middle">{item.q}</h4>
                              </Col>
                              {isApproved && (
                                <Col>
                                  <Tooltip title="Approved">
                                    <BsCheckCircleFill size={18} color={getCssVar('success-color')} />
                                  </Tooltip>
                                </Col>
                              )}
                            </Row>
                          )}
                          <Form.Item
                            {...restField}
                            noStyle={!!isPreview}
                            name={[name, 'a']}
                            rules={[{ whitespace: true, message: 'Space not allowed!' }]}
                          >
                            <Input.TextArea
                              readOnly={isApproved}
                              disabled={isApproved}
                              hidden={isPreview}
                              className={isPreview ? 'pointer-events-none h-0 w-0 opacity-0' : 'mt-2'}
                              rows={1}
                              allowClear
                              maxLength={1000}
                              showCount
                              placeholder="Answer"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </React.Fragment>
                  )
                })}
              </>
            )}
          </Form.List>

          <Row justify="end" align="middle" className="mt-2">
            <Form.Item>
              <Button
                shape="round"
                type="primary"
                htmlType="submit"
                icon={<SendOutlined rotate={-45} />}
                loading={saving}
              >
                Submit
              </Button>
            </Form.Item>
          </Row>
        </Form>
      )}

      <Row justify="center" className="mt-4">
        <Col>
          <Button
            loading={loading}
            disabled={product.common_disable}
            shape="round"
            onClick={handleSubmit}
            type="primary"
            size="large"
            className="cta-btn"
          >
            I&apos;ve Done It
          </Button>
        </Col>
      </Row>

      <p
        className="mb-3 mt-4 text-center text-lg font-medium"
        dangerouslySetInnerHTML={{ __html: data_obj.help_text }}
      />

      <Row justify="center" className="mb-3">
        <Col>
          <CalenderLink
            asBtn={true}
            qs={`?title=${encodeURIComponent('Let a Specialist Set Up Your Google Tags')}&subtitle=`}
          />
        </Col>
      </Row>
    </>
  )
}

export default Website
