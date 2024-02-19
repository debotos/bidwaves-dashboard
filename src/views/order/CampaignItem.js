import React from 'react'
import Axios from 'axios'
import loadable from '@loadable/component'
import { Fade } from 'react-awesome-reveal'
import { BsArrowReturnRight } from 'react-icons/bs'
import { useSafeState, useMount, useUnmount, useUpdateEffect } from 'ahooks'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Modal,
  Row,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  message
} from 'antd'
import {
  BellOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  EditOutlined,
  ReloadOutlined,
  SyncOutlined,
  WarningOutlined
} from '@ant-design/icons'

import keys from 'config/keys'
import { socketIO } from 'App'
import endpoints from 'config/endpoints'
import PaymentInfo from './PaymentInfo'
import handleError from 'helpers/handleError'
import emptyImage from 'assets/images/empty.svg'
import { loadableOptions } from 'components/micro/Common'
import { getErrorAlert, getOrderStatusTag, isEmpty, renderLoading } from 'helpers/utility'
import AsyncDeleteButton from 'components/micro/fields/AsyncDeleteButton'

// const OrderNote = loadable(() => import('./manage/note'), loadableOptions)
const OrderQA = loadable(() => import('./manage/OrderQA'), loadableOptions)
const PaymentUI = loadable(() => import('./manage/PaymentUI'), loadableOptions)
const OrderEdit = loadable(() => import('./manage/OrderEdit'), loadableOptions)
const Video = loadable(() => import('components/micro/Video'), loadableOptions)
const CampaignManager = loadable(() => import('./manage/manager/CampaignManager'), loadableOptions)
const ProductSuggestion = loadable(() => import('./manage/suggestion/ProductSuggestion'), loadableOptions)

function CampaignItem(props) {
  const { order: initialOrder, first, reRenderParent } = props
  const orderId = initialOrder.id
  const orderEp = endpoints.order(orderId)
  const [key, setKey] = useSafeState('order')
  const [fetching, setFetching] = useSafeState(true)
  const [order, setOrder] = useSafeState(initialOrder)
  const [products, setProducts] = useSafeState([])
  const [fetchingProducts, setFetchingProducts] = useSafeState(true)
  const [qaModal, setQAModal] = useSafeState(false)
  const [updateModal, setUpdateModal] = useSafeState(false)
  const [activeProduct, setActiveProduct] = useSafeState(null)

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

  const getOrderProducts = async (silent = false) => {
    try {
      !silent && setFetchingProducts(true)
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

  const getData = async ({ dependent, silent = true } = {}) => {
    let dependentCalled = false
    try {
      !silent && setFetching(true)
      const { data } = await Axios.get(orderEp)
      window.log(`Order/Campaign response: `, data)
      setOrder(data)
      if (dependent) {
        const noQA = isEmpty(data.qa)
        const showOnlyQaUI = !data.qa_approved && !noQA
        if (!showOnlyQaUI) {
          await getOrderProducts(silent)
          dependentCalled = true
        } else {
          setFetchingProducts(false)
        }
      }
    } catch (error) {
      handleError(error, true)
    } finally {
      setFetching(false)
      dependentCalled && setFetchingProducts(false)
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
    getData({ dependent: true })
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

    activeProduct,
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

  const handleRefresh = () => {
    getData()
    !showOnlyQaUI && getOrderProducts(true)
  }

  const getPaymentInfoBtn = () => {
    if (!order.first_payment_date) return null

    return (
      <div onClick={e => e.stopPropagation()}>
        <PaymentInfo order={order} />
      </div>
    )
  }

  const getRefreshBtn = label => {
    return (
      <Tooltip title="Refresh Campaign">
        <Button type="dashed" size="small" onClick={handleRefresh} loading={fetching} icon={<ReloadOutlined />}>
          {label}
        </Button>
      </Tooltip>
    )
  }

  const asyncActionRunning = fetching || fetchingProducts

  const topBarEl = (
    <Row key={key} justify={`space-between`} align={`middle`} gutter={[10, 10]}>
      <Col>{getOrderStatusTag(order.status, order, 'm-0')}</Col>
      <Col>
        <Space size={`middle`} align="end">
          {!asyncActionRunning && !order.complete && getOrderNotification({ ...order, products: products })}
          {getPaymentInfoBtn()}
          <Tooltip
            title={<h5 className="m-0 text-2xl font-bold">{order.advertisement_info?.name}</h5>}
            placement="left"
          >
            <Avatar size="small" src={order.advertisement_info?.image?.secure_url} />
          </Tooltip>
        </Space>
      </Col>
    </Row>
  )

  const getBodyContent = () => {
    if (!order.approved) {
      return (
        <Alert
          showIcon
          type="info"
          message={<b>Please wait until BidWaves set up your next step.</b>}
          description={
            <Space direction="vertical" align="end" size={`middle`}>
              <p className="m-0 font-semibold">
                BidWaves needs to review the fundamental campaign details you&apos;ve submitted and to set up the
                necessary questions for a more thorough understanding of your campaign requirements.
              </p>

              <Space>
                <AsyncDeleteButton
                  label="Delete"
                  endpoint={endpoints.order(order.id)}
                  onFinish={reRenderParent}
                  btnProps={{ size: 'small' }}
                />
                {getRefreshBtn('Refresh')}
              </Space>
            </Space>
          }
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
      <Space className="w-full" direction="vertical" size={`middle`}>
        <Row gutter={[20, 10]} justify={`space-between`} align={`middle`} wrap={false}>
          <Col className="">
            <Space size={`small`}>
              <p className="m-0 font-semibold">Campaign Brief</p>
              {order.qa_approved ? (
                <Tag className="ml-2" color="success" icon={<CheckCircleOutlined />}>
                  Complete
                </Tag>
              ) : (
                <>
                  {order.qa_submitted ? (
                    <Tag className="ml-2" color="processing" icon={<ClockCircleOutlined />}>
                      Submitted
                    </Tag>
                  ) : (
                    <Tag className="ml-2" color="error">
                      Incomplete
                    </Tag>
                  )}
                </>
              )}
            </Space>
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

        {fetchingProducts ? (
          Array((order.products || []).length || 4)
            .fill()
            .map((_, i) => {
              return (
                <Row key={i} justify={`space-between`} align={`middle`} gutter={[30, 0]} wrap={false}>
                  <Col span={16} lg={Math.floor(Math.random() * 7) + 14}>
                    <Skeleton.Button active={true} size="large" block={true} style={{ height: 24 }} />
                  </Col>
                  <Col>
                    <Skeleton.Button active={true} size="large" block={true} style={{ height: 24 }} />
                  </Col>
                </Row>
              )
            })
        ) : (
          <>
            {isEmpty(products) && order.qa_approved ? (
              <Empty
                className="mt-4"
                image={emptyImage}
                description={<p className="m-0">Please add a recommended product to this campaign.</p>}
              />
            ) : (
              products.map(product => {
                const productId = product.id
                const isComplete = product.complete
                const isSubmitted = product.submitted
                const isApproved = product.approved
                const isReady = product.setup_ready
                const common_disable = isComplete || isSubmitted || isApproved || !isReady

                return (
                  <Row gutter={[20, 10]} justify={`space-between`} align={`middle`} key={productId} wrap={false}>
                    <Col className="">
                      <Space wrap>
                        <p className="m-0 font-semibold">{product.product_info?.name}</p>
                        {isComplete ? (
                          <Tag color="success" icon={<CheckCircleOutlined />}>
                            Complete
                          </Tag>
                        ) : isApproved ? (
                          <Tag color="success" icon={<SyncOutlined spin />}>
                            BidWaves Working On It
                          </Tag>
                        ) : (
                          <>
                            {isSubmitted ? (
                              <Tag color="processing" icon={<CheckOutlined />}>
                                Submitted
                              </Tag>
                            ) : (
                              <>
                                {!isReady ? (
                                  <>
                                    <Tag color="cyan" icon={<ClockCircleOutlined />}>
                                      BidWaves Reviewing
                                    </Tag>
                                    <p className="m-0 text-base font-extralight text-cyan-600">
                                      <BsArrowReturnRight className="align-middle" size={14} />
                                      &nbsp;&nbsp;BidWaves will get back to you once it has finished the review.
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <Tag color="warning" icon={<WarningOutlined />}>
                                      Incomplete
                                    </Tag>
                                  </>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </Space>
                    </Col>
                    <Col>
                      {!common_disable && (
                        <Button
                          type="primary"
                          disabled={common_disable}
                          shape="round"
                          size="small"
                          onClick={() => setActiveProduct(product)}
                        >
                          Complete
                        </Button>
                      )}
                    </Col>
                  </Row>
                )
              })
            )}
          </>
        )}
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
                <h5 className="m-0 text-2xl font-bold">{order.name}</h5>

                {order.approved && (
                  <Tooltip title="Edit">
                    <Button type="link" size="large" icon={<EditOutlined />} onClick={() => setUpdateModal(true)} />
                  </Tooltip>
                )}
              </Space>
              <Card size="small" title={order.approved && topBarEl} styles={{ body: { position: 'relative' } }}>
                {fetching ? (
                  renderLoading({ className: 'my-5' })
                ) : (
                  <>
                    <div className="px-4 py-3 lg:px-6 lg:py-6">{getBodyContent()}</div>
                  </>
                )}
              </Card>
            </Fade>
          </Col>
          <Col span={24} lg={12}>
            {order.approved && order.active && order.qa_approved && !order.complete && (
              <Fade>
                <ProductSuggestion {...props} {...cProps} />
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
        maskClosable={false}
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
        maskClosable={false}
        onCancel={() => setUpdateModal(false)}
        className="ant-modal-width-full"
      >
        <OrderEdit key={key} {...props} {...cProps} closeModal={() => setUpdateModal(false)} />
      </Modal>

      <Modal
        destroyOnClose
        // title=""
        open={!isEmpty(activeProduct)}
        footer={null}
        maskClosable={false}
        onCancel={() => setActiveProduct(null)}
        className="ant-modal-width-full"
        afterClose={() => getData({ dependent: true, silent: true })}
      >
        <div className="relative mt-4">
          <Row gutter={[20, 20]}>
            {/* <Col span={24} md={14} lg={16} xl={17} xxl={18}> */}
            <Col span={24}>
              <CampaignManager {...props} {...cProps} closeModal={() => setActiveProduct(null)} />
            </Col>
            {/* <Col span={24} md={10} lg={8} xl={7} xxl={6}>
              <OrderNote {...props} {...cProps} />
            </Col> */}
          </Row>
          {order.video_guide ? <Video url={order.video_guide} /> : null}
        </div>
      </Modal>
    </>
  )
}

export default CampaignItem

const getOrderNotification = order => {
  if (!order) return null
  if (!order.approved) return null

  let title

  if (!order.qa_submitted && !isEmpty(order.qa)) {
    title = 'Please review the brief and submit.'
  } else if (order.pending_payment_info) {
    title = 'Please review the payment details & pay to continue.'
  } else if (order.qa_approved && isEmpty(order.products)) {
    title = 'Please add at least one product in this campaign to continue.'
  } else if (order.qa_approved && !isEmpty(order.products)) {
    if (order.products.some(x => x.setup_ready && !x.submitted)) {
      title = 'BidWaves added necessary configuration for this campaign product(s). Please review and take action.'
    }
  }

  if (!title) return null
  return (
    <Tooltip title={title} placement="left">
      <Badge dot={true}>
        <BellOutlined />
      </Badge>
    </Tooltip>
  )
}
