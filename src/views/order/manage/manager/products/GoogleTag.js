import React from 'react'
import { useSafeState } from 'ahooks'
import { Button, Col, Row, message } from 'antd'

import { CalenderLink } from 'components/micro/Common'
import { replaceTextWithComponent } from 'helpers/utility'

function GoogleTag(props) {
  const { product, asyncUpdateProduct, closeModal } = props
  const calender_link = product.product_info?.calender_link
  const { data_obj } = product || {}
  const [loading, setLoading] = useSafeState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await asyncUpdateProduct(product.id, { submitted: true })
      closeModal?.()
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

  const qs = `?title=${encodeURIComponent(
    'Let a Specialist Set Up Your Google Tags'
  )}&subtitle=&src=${encodeURIComponent(calender_link)}`

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

      <p className="mb-3 mt-4 text-center text-lg font-medium">
        {replaceTextWithComponent(
          data_obj.help_text || '',
          'book a call here',
          <CalenderLink label={`book a call here`} qs={qs} anchorClassName="" />
        )}
      </p>

      {calender_link && (
        <Row justify="center" className="mb-3">
          <Col>
            <CalenderLink asBtn={true} qs={qs} />
          </Col>
        </Row>
      )}
    </>
  )
}

export default GoogleTag
