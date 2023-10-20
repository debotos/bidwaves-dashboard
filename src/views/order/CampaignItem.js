import React from 'react'
import Axios from 'axios'
import Fade from 'react-reveal/Fade'
import styled from 'styled-components'
import loadable from '@loadable/component'
import { useSafeState, useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { Alert, Avatar, Button, Card, Col, Modal, Row, Space, Tag, Tooltip, message } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons'

import keys from 'config/keys'
import { socketIO } from 'App'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { getErrorAlert, isEmpty } from 'helpers/utility'
import { loadableOptions } from 'components/micro/Common'

// const OrderNote = loadable(() => import('./manage/note'), loadableOptions)
const OrderQA = loadable(() => import('./manage/OrderQA'), loadableOptions)
const PaymentUI = loadable(() => import('./manage/PaymentUI'), loadableOptions)
const OrderEdit = loadable(() => import('./manage/OrderEdit'), loadableOptions)
// const Video = loadable(() => import('components/micro/Video'), loadableOptions)
// const CampaignManager = loadable(() => import('./manage/manager/CampaignManager'), loadableOptions)
const ProductSuggestion = loadable(() => import('./manage/suggestion/ProductSuggestion'), loadableOptions)

function CampaignItem(props) {
  const { order: initialOrder, first } = props
  const orderId = initialOrder.id
  const orderEp = endpoints.order(orderId)
  const [key, setKey] = useSafeState('order')
  const [fetching, setFetching] = useSafeState(true)
  const [order, setOrder] = useSafeState(initialOrder)
  const [products, setProducts] = useSafeState([])
  const [fetchingProducts, setFetchingProducts] = useSafeState(true)
  const [qaModal, setQAModal] = useSafeState(false)
  const [updateModal, setUpdateModal] = useSafeState(false)

  const reRender = () => setKey(new Date().valueOf())
  const updateOrder = (updates = {}) => setOrder(prevValues => ({ ...prevValues, ...updates }))
  const updateProduct = (id, updates = {}) => {
    setProducts(prevValues =>
      prevValues.map(x => {
        if (x.id === id) return { ...x, ...updates }
        return x
      })
    )
  }
  const deleteProduct = id => setProducts(prevValues => prevValues.filter(x => x.id !== id))

  const getOrderProducts = async () => {
    try {
      setFetchingProducts(true)
      const { data } = await Axios.get(orderEp + `/product?all=true`)
      window.log(`Order/Campaign products response: `, data)
      const list = data?.list || []
      setProducts(list)
    } catch (error) {
      handleError(error, true)
    } finally {
      setFetchingProducts(false)
    }
  }

  const getData = async () => {
    try {
      setFetching(true)
      const { data } = await Axios.get(orderEp)
      window.log(`Order/Campaign response: `, data)
      setOrder(data)
    } catch (error) {
      handleError(error, true)
    } finally {
      setFetching(false)
    }
  }

  useUpdateEffect(() => {
    reRender()
  }, [order])

  const handleRefetch = info => {
    if (orderId === info.id) getData()
  }

  const listenSocketIOEvents = () => {
    socketIO.on(keys.IO_EVENTS.CLIENT_REFETCH_ORDER, handleRefetch)
  }

  const stopListeningSocketIOEvents = () => {
    socketIO.off(keys.IO_EVENTS.CLIENT_REFETCH_ORDER, handleRefetch)
  }

  useMount(() => {
    getData()
    listenSocketIOEvents()
  })

  useUnmount(() => {
    stopListeningSocketIOEvents()
  })

  if (isEmpty(order)) return getErrorAlert({ onRetry: getData })

  const asyncUpdateProduct = async (productId, values) => {
    try {
      const { data: res } = await Axios.patch(orderEp + `/product/${productId}`, values)
      window.log(`Update order product response -> `, res)
      message.success('Action successful.')
      updateProduct(productId, res)
    } catch (error) {
      handleError(error, true)
    }
  }

  const cProps = {
    orderEp,
    fetching,
    order,
    setOrder,
    updateOrder,
    refetch: getData,

    fetchingProducts,
    products,
    setProducts,
    updateProduct,
    asyncUpdateProduct,
    deleteProduct,
    refetchProducts: getOrderProducts,
    getCurrentOrderedProductIds: () => products.map(x => x.id),
    getCurrentProductIds: () => products.map(x => x.productId)
  }

  const noQA = isEmpty(order.qa)
  const showOnlyQaUI = !order.qa_approved && !noQA

  const refreshBtnEl = (
    <RefreshButton>
      <Tooltip title="Refresh">
        <Button
          type="dashed"
          size="small"
          onClick={() => {
            getData()
            !showOnlyQaUI && getOrderProducts()
          }}
          loading={fetching}
          icon={<ReloadOutlined />}
        />
      </Tooltip>
    </RefreshButton>
  )

  const getBodyContent = () => {
    if (!order.approved) {
      return (
        <Alert
          showIcon
          type="info"
          message="Please wait until CMS review."
          description="Please wait for the CMS to review the fundamental campaign details you've submitted and to set up the necessary questions for a more thorough understanding of your campaign requirements."
        />
      )
    }

    if (order.complete) {
      return <Alert message="This campaign has already been marked as complete!" type="success" showIcon />
    } else if (!order.active) {
      return <Alert message="This campaign is not active." type="warning" showIcon />
    }

    if (!isEmpty(order.pending_payment_info)) {
      return (
        <Fade>
          <PaymentUI key={key} {...props} {...cProps} />
        </Fade>
      )
    }

    return (
      <Space className="w-full" direction="vertical">
        <Row gutter={[20, 10]} justify={`space-between`} align={`middle`}>
          <Col className="">
            Questionnaire{' '}
            {order.qa_approved ? (
              <Tag className="ml-2" color="success" icon={<CheckCircleOutlined />}>
                Complete
              </Tag>
            ) : (
              <>
                {order.qa_submitted ? (
                  <Tag className="ml-2" color="success" icon={<ClockCircleOutlined />}>
                    Submitted
                  </Tag>
                ) : (
                  <Tag className="ml-2" color="error">
                    Incomplete
                  </Tag>
                )}
              </>
            )}
          </Col>
          <Col>
            {!order.qa_approved && (
              <Button
                type="primary"
                disabled={!order.allow_qa_edit}
                shape="round"
                size="small"
                onClick={() => setQAModal(true)}
              >
                Complete
              </Button>
            )}
          </Col>
        </Row>
      </Space>
    )
  }

  return (
    <>
      <div className={`mb-5 ${first ? 'mt-4' : ''}`}>
        <Row gutter={[40, 20]}>
          <Col span={24} lg={12}>
            <Fade>
              <Space className="mb-2">
                <Tooltip
                  title={
                    <Space align="center">
                      <Avatar size="large" src={order.advertisement_info?.image?.secure_url} />
                      <h5 className="m-0 text-2xl font-bold">{order.advertisement_info?.name}</h5>
                    </Space>
                  }
                >
                  <h5 className="m-0 text-2xl font-bold">{order.name}</h5>
                </Tooltip>
                <Tooltip title="Edit">
                  <Button type="link" size="large" icon={<EditOutlined />} onClick={() => setUpdateModal(true)} />
                </Tooltip>
              </Space>
              <Card size="small" bodyStyle={{ position: 'relative' }}>
                {refreshBtnEl}
                <div className="px-4 py-3 lg:px-8 lg:py-8">{getBodyContent()}</div>
              </Card>
            </Fade>
          </Col>
          <Col span={24} lg={12}>
            {order.approved && order.active && order.qa_approved && !order.complete && (
              <Fade>
                <Space className="mb-3">
                  <h5 className="m-0 text-2xl font-bold">Recommended From Your CSM</h5>
                </Space>
                <div>
                  <ProductSuggestion {...props} {...cProps} />
                </div>
              </Fade>
            )}
          </Col>
        </Row>
      </div>

      <Modal
        destroyOnClose
        title="Campaign Questions"
        open={qaModal}
        footer={null}
        onCancel={() => setQAModal(false)}
        className="ant-modal-width-mid"
      >
        <p>Finish Your Campaign Setup</p>
        <OrderQA key={key} {...props} {...cProps} closeModal={() => setQAModal(false)} />
      </Modal>

      <Modal
        destroyOnClose
        title="Campaign Information Update"
        open={updateModal}
        footer={null}
        onCancel={() => setUpdateModal(false)}
        className="ant-modal-width-full"
      >
        <OrderEdit key={key} {...props} {...cProps} closeModal={() => setUpdateModal(false)} />
      </Modal>
    </>
  )
}

export default CampaignItem

const RefreshButton = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`
