import React from 'react'
import { useSafeState } from 'ahooks'
import { SendOutlined } from '@ant-design/icons'
import { Alert, Button, Form, Input, Row, Tooltip } from 'antd'

function CallRail(props) {
  const [form] = Form.useForm()
  const { product, asyncUpdateProduct, closeModal } = props
  const { data_obj } = product || {}
  const [saving, setSaving] = useSafeState(false)

  const handleSave = async values => {
    try {
      setSaving(true)
      await asyncUpdateProduct(product.id, { submitted: true, data_obj: { ...data_obj, ...values } })
      closeModal?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {data_obj.instruction_text && <p dangerouslySetInnerHTML={{ __html: data_obj.instruction_text }} />}

      {data_obj.cms_comment && <Alert className="mb-3" message={data_obj.cms_comment} type="info" showIcon />}

      <Form
        form={form}
        disabled={product.common_disable}
        layout="vertical"
        onFinish={handleSave}
        initialValues={product.data_obj ?? {}}
      >
        <Tooltip
          key="phone"
          trigger={['focus']}
          title={`Please prefix the number with valid country code (eg. +88)`}
          placement="topLeft"
        >
          <Form.Item
            name={`phone`}
            label="Please confirm the number for the call rail"
            rules={[{ required: true, whitespace: true, message: 'Provide valid number with country code!' }]}
          >
            <Input allowClear placeholder="Number with country code" />
          </Form.Item>
        </Tooltip>
        <Tooltip
          key="phone2"
          trigger={['focus']}
          title={`Please prefix the number with valid country code (eg. +88)`}
          placement="topLeft"
        >
          <Form.Item
            name={`phone2`}
            label="If there is another number, please put it here"
            rules={[{ whitespace: true, message: 'Provide valid number with country code!' }]}
          >
            <Input allowClear placeholder="Additional number with country code" />
          </Form.Item>
        </Tooltip>
        <p
          className="mb-3 mt-4 text-center text-lg font-medium"
          dangerouslySetInnerHTML={{ __html: data_obj.help_text }}
        />
        <Row justify="center" align="middle" className="mt-2">
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
    </>
  )
}

export default CallRail
