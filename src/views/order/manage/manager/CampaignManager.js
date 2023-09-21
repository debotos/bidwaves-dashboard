import React from 'react'
import { useMount } from 'ahooks'
import Fade from 'react-reveal/Fade'
import { Card, Empty, Skeleton, Space } from 'antd'

import { isEmpty } from 'helpers/utility'

function CampaignManager(props) {
  const { fetching, fetchingProducts, refetchProducts, products } = props

  useMount(() => refetchProducts())

  if (fetching || fetchingProducts) {
    return Array(8)
      .fill()
      .map((_, i) => (
        <Fade key={i}>
          <Card size="small" className={`mb-3 ${i === 0 ? 'mt-2' : ''}`}>
            <Skeleton.Button active={true} size="large" block={true} style={{ height: 100 }} />
          </Card>
        </Fade>
      ))
  }

  if (isEmpty(products)) {
    return (
      <Fade>
        <Empty
          className="mt-5"
          description={
            <Space direction="vertical" align="center">
              <p className="m-0">{`You didn't added any product to this campaign.`}</p>
            </Space>
          }
        />
      </Fade>
    )
  }

  return (
    <div>
      <pre>{JSON.stringify(products, null, 2)}</pre>
    </div>
  )
}

export default CampaignManager
