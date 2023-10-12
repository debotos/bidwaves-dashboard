import React from 'react'
import { useSafeState } from 'ahooks'
import { SendOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Form, Input, Row, Space, Tooltip, Typography, message } from 'antd'

import { getCssVar, isEmpty } from 'helpers/utility'
import { CalenderLink } from 'components/micro/Common'
import { BsCheckCircleFill } from 'react-icons/bs'

function Website(props) {
  const [form] = Form.useForm()
  const { product, asyncUpdateProduct } = props
  const calender_link = product.product_info?.calender_link
  const { data_obj } = product || {}
  const { qa, records } = data_obj || {}
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
        <Form
          form={form}
          disabled={product.common_disable}
          layout="vertical"
          onFinish={handleSave}
          initialValues={product.data_obj ?? {}}
        >
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
                              {item.q ? (
                                <p
                                  className="m-0 text-center text-sm font-thin"
                                  dangerouslySetInnerHTML={{ __html: item.q }}
                                />
                              ) : null}
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

      {!isEmpty(records) && (
        <Space direction="vertical" size="middle" className="w-100">
          {records.map((record, index) => {
            if (isEmpty(record) || isEmpty(record.rows)) return null
            const cols = 24 / (Number(record.cols) || 3)
            return (
              <Card key={index} size="small" title={record.title ?? ''}>
                {record.description && (
                  <p className="text-sm" dangerouslySetInnerHTML={{ __html: record.description }} />
                )}
                <Space direction="vertical" className="w-100">
                  {record.rows.map((row, rowIndex) => {
                    if (isEmpty(row)) return null
                    return (
                      <Row key={rowIndex} gutter={[10, 10]} align={`middle`} wrap={true}>
                        {row.map((col, colIndex) => {
                          if (isEmpty(col) || isEmpty(col.value)) return null
                          return (
                            <Col key={colIndex} span={24} md={cols}>
                              <Row wrap={false}>
                                {col.label && (
                                  <Col>
                                    <p className="m-0 pr-2 font-bold">{col.label}:</p>
                                  </Col>
                                )}
                                <Col flex={1}>
                                  <Typography.Text copyable={!!col.copyable} code={!!col.code}>
                                    {col.value}
                                  </Typography.Text>
                                </Col>
                              </Row>
                            </Col>
                          )
                        })}
                      </Row>
                    )
                  })}
                </Space>
              </Card>
            )
          })}
        </Space>
      )}

      {data_obj.show_cta && (
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
      )}

      <p
        className="mb-3 mt-4 text-center text-lg font-medium"
        dangerouslySetInnerHTML={{ __html: data_obj.help_text }}
      />

      {calender_link && (
        <Row justify="center" className="mb-3">
          <Col>
            <CalenderLink
              asBtn={true}
              qs={`?title=${encodeURIComponent(
                'Great! Let Us Schedule a Call For Your Website'
              )}&subtitle=&src=${encodeURIComponent(calender_link)}`}
            />
          </Col>
        </Row>
      )}
    </>
  )
}

export default Website
