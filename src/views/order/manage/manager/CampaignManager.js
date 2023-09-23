import React from 'react'
import Fade from 'react-reveal/Fade'
import { useMount, useUnmount } from 'ahooks'
import { Card, Empty, Skeleton, Space, Tag } from 'antd'

import keys from 'config/keys'
import { socketIO } from 'App'
import { isEmpty } from 'helpers/utility'
import AsyncDeleteButton from 'components/micro/fields/AsyncDeleteButton'

function CampaignManager(props) {
  const { orderEp, fetching, fetchingProducts, refetchProducts, products, deleteProduct, updateProduct } = props

  const handleDeleteProduct = info => deleteProduct(info.id)
  const handleComplete = info => updateProduct(info.id, { complete: true })

  const listenSocketIOEvents = () => {
    socketIO.on(keys.IO_EVENTS.ORDER_PRODUCT_DELETED, handleDeleteProduct)
    socketIO.on(keys.IO_EVENTS.CLIENT_ORDER_PRODUCT_COMPLETE, handleComplete)
  }

  const stopListeningSocketIOEvents = () => {
    socketIO.off(keys.IO_EVENTS.ORDER_PRODUCT_DELETED, handleDeleteProduct)
    socketIO.off(keys.IO_EVENTS.CLIENT_ORDER_PRODUCT_COMPLETE, handleComplete)
  }

  useMount(() => {
    listenSocketIOEvents()
    refetchProducts()
  })

  useUnmount(() => {
    stopListeningSocketIOEvents()
  })

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
    <>
      {products.map((product, index) => {
        const isFirstProduct = index === 0
        const isComplete = product.complete
        const productId = product.id
        const productEp = orderEp + `/product/${productId}`

        return (
          <Fade key={productId}>
            <Card
              size="small"
              title={
                <Space>
                  <b>{product.product_info?.name}</b>
                  {isComplete && <Tag color="success">Complete</Tag>}
                </Space>
              }
              className={`mb-3 ${isFirstProduct ? 'mt-2' : ''}`}
              bodyStyle={isComplete ? { padding: 0 } : {}}
              extra={
                <Space size="middle">
                  <AsyncDeleteButton
                    disabled={isComplete}
                    endpoint={productEp}
                    onFinish={() => deleteProduct(productId)}
                  />
                </Space>
              }
            >
              {isComplete ? null : (
                <>
                  <pre>{JSON.stringify(product, null, 2)}</pre>
                </>
              )}
            </Card>
          </Fade>
        )
      })}
    </>
  )
}

export default CampaignManager
