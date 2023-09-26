import React from 'react'
import { useSafeState } from 'ahooks'
import { Button, Col, Row, message } from 'antd'

import { CalenderLink } from 'components/micro/Common'

function GoogleTag(props) {
  const { product, asyncUpdateProduct } = props
  const { data_obj } = product || {}
  const [loading, setLoading] = useSafeState(false)

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
      message.success('Script copied to the clipboard.')
    } catch (error) {
      console.error('Error copying script:', error)
      message.error('Failed to copy script to the clipboard.')
    }
  }

  return (
    <>
      <p dangerouslySetInnerHTML={{ __html: data_obj.instruction_text }} />

      <div className="relative whitespace-pre-wrap rounded-lg border border-solid border-[--body-bg-color] bg-[--body-bg-color] p-4">
        <pre className="m-0">{data_obj.script}</pre>
        <Button onClick={handleCopyClick} type="dashed" size="small" className="absolute right-2 top-2">
          Copy
        </Button>
      </div>

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

export default GoogleTag
