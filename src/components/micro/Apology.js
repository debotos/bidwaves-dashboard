import React from 'react'
import { Result, Button, Row } from 'antd'

const Apology = () => {
  return (
    <Row justify="center" align="middle" className="w-100" style={{ minHeight: '100vh' }}>
      <Result
        status="500"
        title="500"
        subTitle={`Sorry, Something went wrong. Please try again via refresh.`}
        extra={
          <Button type="dashed" onClick={() => window.location.reload()}>
            <b>Refresh</b>
          </Button>
        }
      />
    </Row>
  )
}

export default React.memo(Apology)
