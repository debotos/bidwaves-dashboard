import React from 'react'
import Axios from 'axios'
import Fade from 'react-reveal/Fade'
import { useSelector } from 'react-redux'
import loadable from '@loadable/component'
import { useMount, useSet, useUnmount } from 'ahooks'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Empty, Skeleton, Space, Tag, Tooltip } from 'antd'

import keys from 'config/keys'
import { socketIO } from 'App'
import { isEmpty } from 'helpers/utility'
import handleError from 'helpers/handleError'
import { loadableOptions } from 'components/micro/Common'
import AsyncDeleteButton from 'components/micro/fields/AsyncDeleteButton'

const Website = loadable(() => import('./products/Website'), loadableOptions)
const CallRail = loadable(() => import('./products/CallRail'), loadableOptions)
const GoogleTag = loadable(() => import('./products/GoogleTag'), loadableOptions)
const CustomGraphics = loadable(() => import('./products/CustomGraphics'), loadableOptions)

function CampaignManager(props) {
  const { orderEp, fetching, fetchingProducts, refetchProducts, products, deleteProduct, updateProduct } = props
  const { user } = useSelector(state => state.auth)
  const [set, { add, remove, reset }] = useSet([])

  const getSingleOrderProduct = async id => {
    try {
      const { data } = await Axios.get(orderEp + `/product/${id}`)
      window.log(`Order/Campaign product response: `, data)
      data && updateProduct(id, data)
    } catch (error) {
      handleError(error, true)
    }
  }

  const handleDeleteProduct = info => deleteProduct(info.id)
  const handleCommonBoolUpdate = info => updateProduct(info.id, { [info.property]: info.value })
  const refetchSingleOrderProduct = info => info.clientId === user.id && getSingleOrderProduct(info.id)

  const listenSocketIOEvents = () => {
    socketIO.on(keys.IO_EVENTS.ORDER_PRODUCT_DELETED, handleDeleteProduct)
    socketIO.on(keys.IO_EVENTS.CLIENT_ORDER_PRODUCT_REFETCH, refetchSingleOrderProduct)
    socketIO.on(keys.IO_EVENTS.ORDER_PRODUCT_COMMON_BOOL_UPDATE, handleCommonBoolUpdate)
    socketIO.on(keys.IO_EVENTS.CLIENT_ORDER_PRODUCT_COMMON_BOOL_UPDATE, handleCommonBoolUpdate)
  }

  const stopListeningSocketIOEvents = () => {
    socketIO.off(keys.IO_EVENTS.ORDER_PRODUCT_DELETED, handleDeleteProduct)
    socketIO.off(keys.IO_EVENTS.CLIENT_ORDER_PRODUCT_REFETCH, refetchSingleOrderProduct)
    socketIO.off(keys.IO_EVENTS.ORDER_PRODUCT_COMMON_BOOL_UPDATE, handleCommonBoolUpdate)
    socketIO.off(keys.IO_EVENTS.CLIENT_ORDER_PRODUCT_COMMON_BOOL_UPDATE, handleCommonBoolUpdate)
  }

  useMount(() => {
    listenSocketIOEvents()
    refetchProducts()
  })

  useUnmount(() => {
    stopListeningSocketIOEvents()
    reset()
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

  const getProductComponent = product => {
    if (!product.setup_ready) {
      return (
        <Alert
          showIcon
          type="info"
          message="Please wait until CMS setup or update the necessary configuration for this product."
        />
      )
    }

    const cProps = { product }
    const type = product.product_info?.type
    if (!type) {
      return <Alert showIcon type="error" message="Something is wrong. Original product not found. Contact support." />
    }

    switch (type) {
      case keys.PRODUCT_TYPES.google_tag:
        return <GoogleTag {...props} {...cProps} />

      case keys.PRODUCT_TYPES.website:
        return <Website {...props} {...cProps} />

      case keys.PRODUCT_TYPES.call_rail:
        return <CallRail {...props} {...cProps} />

      case keys.PRODUCT_TYPES.custom_graphics:
        return <CustomGraphics {...props} {...cProps} />

      default:
        return <Alert showIcon type="error" message="Not implemented yet." />
    }
  }

  return (
    <>
      {products.map((product, index) => {
        const isActive = set.has(product.id)
        const isFirstProduct = index === 0
        const isComplete = product.complete
        const isSubmitted = product.submitted
        const isApproved = product.approved
        const productId = product.id
        const productEp = orderEp + `/product/${productId}`
        const common_disable = isComplete || isSubmitted || isApproved

        const handleToggleView = e => {
          e.stopPropagation()
          if (isActive) {
            remove(productId)
          } else {
            add(productId)
          }
        }

        return (
          <Fade key={productId}>
            <Card
              size="small"
              title={
                <Space onClick={handleToggleView} className="cursor-pointer">
                  <b>{product.product_info?.name}</b>
                  {isComplete ? (
                    <Tag color="success">Complete</Tag>
                  ) : isApproved ? (
                    <Tag color="success">Approved</Tag>
                  ) : (
                    <>{isSubmitted && <Tag color="processing">Submitted. Waiting for CMS to review.</Tag>}</>
                  )}
                </Space>
              }
              className={`mb-3 ${isFirstProduct ? 'mt-2' : ''}`}
              bodyStyle={isComplete || !isActive ? { padding: 0 } : {}}
              extra={
                <Space size="middle">
                  <AsyncDeleteButton
                    disabled={common_disable}
                    endpoint={productEp}
                    onFinish={() => deleteProduct(productId)}
                  />
                  {!isComplete && (
                    <Tooltip title={isActive ? 'Click to hide' : 'Click to view'}>
                      <Button
                        size="small"
                        icon={isActive ? <DownOutlined /> : <UpOutlined />}
                        onClick={handleToggleView}
                      />
                    </Tooltip>
                  )}
                </Space>
              }
            >
              {isComplete || !isActive ? null : (
                <Fade>{getProductComponent({ ...product, common_disable, productEp })}</Fade>
              )}
            </Card>
          </Fade>
        )
      })}
    </>
  )
}

export default CampaignManager
