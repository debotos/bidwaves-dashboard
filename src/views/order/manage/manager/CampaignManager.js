import React from 'react'
import Axios from 'axios'
import moment from 'moment'
import Fade from 'react-reveal/Fade'
import { useSelector } from 'react-redux'
import loadable from '@loadable/component'
import { useMount, useUnmount } from 'ahooks'
import { Alert, Button, Col, Divider, Popconfirm, Row, Space } from 'antd'

import keys from 'config/keys'
import { socketIO } from 'App'
import { isEmpty, readableTime } from 'helpers/utility'
import handleError from 'helpers/handleError'
import { CalenderLink, loadableOptions } from 'components/micro/Common'
import AsyncDeleteButton from 'components/micro/fields/AsyncDeleteButton'

const Website = loadable(() => import('./products/Website'), loadableOptions)
const CallRail = loadable(() => import('./products/CallRail'), loadableOptions)
const GoogleTag = loadable(() => import('./products/GoogleTag'), loadableOptions)
const CustomGraphics = loadable(() => import('./products/CustomGraphics'), loadableOptions)

function CampaignManager(props) {
  const { orderEp, deleteProduct, updateProduct, activeProduct, closeModal } = props
  const { user } = useSelector(state => state.auth)

  const getSingleOrderProduct = async id => {
    try {
      const { data } = await Axios.get(orderEp + `/product/${id}`)
      window.log(`Order/Campaign product response: `, data)
      data && updateProduct(id, data)
    } catch (error) {
      handleError(error, true)
    }
  }

  const handleDeleteProduct = info => {
    deleteProduct(info.id)
    closeModal?.()
  }
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
  })

  useUnmount(() => {
    stopListeningSocketIOEvents()
  })

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

      case keys.PRODUCT_TYPES.call_account_manager:
      case keys.PRODUCT_TYPES.analytics_setup:
      case keys.PRODUCT_TYPES.google_shop_campaigns_setup:
      case keys.PRODUCT_TYPES.crm_integration_with_unbounce:
      case keys.PRODUCT_TYPES.bing_import_from_google: {
        const calender_link = product.product_info?.calender_link
        if (!calender_link) return <Alert showIcon type="info" message="Please contact CMS." />
        if (product.common_disable) {
          return <Alert showIcon type="success" message="Everything is good to go from your side. No action needed." />
        }

        let label = 'Schedule a Meeting'
        let title = 'Schedule a Call With'
        let subtitle = ''

        switch (type) {
          case keys.PRODUCT_TYPES.call_account_manager:
            title = 'Schedule a Monthly Reoccurring Meeting'
            subtitle = 'This will be sent to the calendar on the same day every month.'
            break

          default:
            break
        }

        return (
          <>
            <div className="my-3 flex justify-center">
              <CalenderLink
                asBtn={true}
                label={label}
                qs={`?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(
                  subtitle
                )}&src=${encodeURIComponent(calender_link)}`}
              />
            </div>
            <div className="my-3 flex justify-center">
              <Popconfirm
                disabled={product.common_disable}
                okText="Yes"
                cancelText="No"
                title="Are you sure? Please check your calendar first."
                onConfirm={async () => {
                  await props.asyncUpdateProduct?.(product.id, { submitted: true })
                  closeModal?.()
                }}
              >
                <Button shape="round" type="primary" size="middle" className="cta-btn">
                  I&apos;ve Done It
                </Button>
              </Popconfirm>
            </div>
          </>
        )
      }

      default:
        return <Alert showIcon type="error" message="Not implemented yet." />
    }
  }

  if (isEmpty(activeProduct)) return null

  const renderUI = () => {
    const product = activeProduct
    const isComplete = product.complete
    const isSubmitted = product.submitted
    const isApproved = product.approved
    const productId = product.id
    const productEp = orderEp + `/product/${productId}`
    const common_disable = isComplete || isSubmitted || isApproved

    return (
      <Fade key={productId}>
        <div>
          <Divider>{product.product_info?.name}</Divider>

          <Fade>{getProductComponent({ ...product, common_disable, productEp })}</Fade>

          <Divider />
          <Row justify={`space-between`} align={`middle`} gutter={[20, 20]}>
            <Col>
              <Space direction="vertical" size={`small`} align="end">
                <Space>
                  <p className="m-0 text-sm font-semibold">Last Updated:</p>
                  <p className="m-0 text-sm font-medium">{readableTime(product.updatedAt)}</p>
                  <p className="m-0 text-sm font-medium">({moment(product.updatedAt).fromNow()})</p>
                </Space>
                <Space>
                  <p className="m-0 text-sm font-semibold">Added:</p>
                  <p className="m-0 text-sm font-medium">{readableTime(product.createdAt)}</p>
                  <p className="m-0 text-sm font-medium">({moment(product.createdAt).fromNow()})</p>
                </Space>
              </Space>
            </Col>
            {!isComplete && (
              <Col>
                <AsyncDeleteButton
                  label="Remove From This Campaign"
                  disabled={common_disable}
                  endpoint={productEp}
                  onFinish={() => deleteProduct(productId)}
                  btnProps={{ size: 'middle' }}
                />
              </Col>
            )}
          </Row>
        </div>
      </Fade>
    )
  }

  return <>{renderUI()}</>
}

export default CampaignManager
