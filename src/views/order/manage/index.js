import Axios from 'axios'
import Fade from 'react-reveal/Fade'
import styled from 'styled-components'
import loadable from '@loadable/component'
import { Button, Col, Row, Alert, Tabs, message } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useSafeState, useMount, useUnmount, useUpdateEffect } from 'ahooks'

import keys from 'config/keys'
import { socketIO } from 'App'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { getErrorAlert, isEmpty } from 'helpers/utility'
import { loadableOptions } from 'components/micro/Common'

import { ctaLabel } from './OrderQA'

const OrderNote = loadable(() => import('./note'), loadableOptions)
const OrderQA = loadable(() => import('./OrderQA'), loadableOptions)
const OrderEdit = loadable(() => import('./OrderEdit'), loadableOptions)
const Video = loadable(() => import('components/micro/Video'), loadableOptions)
// const OrderAssetList = loadable(() => import('./OrderAssetList'), loadableOptions)
const CampaignManager = loadable(() => import('./manager/CampaignManager'), loadableOptions)
const ProductSuggestion = loadable(() => import('./suggestion/ProductSuggestion'), loadableOptions)

const first_tab_key = 'campaign_manager'
const suggestion_tab_key = 'product_suggestion'

const Manage = props => {
  const { order: initialOrder } = props
  const orderId = initialOrder.id
  const orderEp = endpoints.order(orderId)
  const [key, setKey] = useSafeState('order')
  const [fetching, setFetching] = useSafeState(true)
  const [order, setOrder] = useSafeState(initialOrder)
  const [products, setProducts] = useSafeState([])
  const [fetchingProducts, setFetchingProducts] = useSafeState(true)
  const [activeTabKey, setActiveTabKey] = useSafeState(first_tab_key)

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

  const getOrderProducts = async () => {
    try {
      setFetchingProducts(true)
      const { data } = await Axios.get(orderEp + `/product?all=true`)
      window.log(`Order/Campaign products response: `, data)
      const list = data?.list || []
      setProducts(list)
      if (isEmpty(list)) {
        message.info('Please add at least one product to this campaign to continue.', 5)
        setActiveTabKey(suggestion_tab_key)
      }
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

  const cProps = {
    fetching,
    order,
    setOrder,
    updateOrder,
    refetch: getData,

    fetchingProducts,
    products,
    setProducts,
    updateProduct,
    refetchProducts: getOrderProducts,
    currentProductIds: products.map(x => x.productId)
  }

  if (order.done) {
    return <Alert message="This campaign has already been marked as complete!" type="success" showIcon />
  }

  const noQA = isEmpty(order.qa)
  const QA_UI = (
    <Fade>
      <OrderQA {...props} {...cProps} />
    </Fade>
  )

  if (!order.qa_approved && !noQA) {
    return (
      <>
        <Alert
          className="mb-3 mt-2"
          message={
            <>
              {order.qa_submitted && !order.qa_approved ? (
                <>Please wait until CMS review the answers.</>
              ) : (
                <>
                  Please <b>{ctaLabel}</b> the answers of this below questions to get started.
                </>
              )}
            </>
          }
          type="info"
          showIcon
        />
        {QA_UI}
      </>
    )
  }

  const items = [
    {
      label: 'Campaign Manager',
      key: first_tab_key,
      children: (
        <>
          <Row gutter={[20, 20]}>
            <Col span={24} md={14} lg={16} xl={17} xxl={18}>
              <CampaignManager {...props} {...cProps} />
            </Col>
            <Col span={24} md={10} lg={8} xl={7} xxl={6}>
              <OrderNote {...props} {...cProps} />
            </Col>
          </Row>
        </>
      )
    },
    ...(noQA ? [] : [{ label: 'Campaign QA', key: 'campaign_qa', children: QA_UI }]),
    {
      label: 'Product Suggestion',
      key: suggestion_tab_key,
      children: (
        <Fade>
          <ProductSuggestion key={key} {...props} {...cProps} />
        </Fade>
      )
    },
    {
      label: 'Campaign Update',
      key: 'campaign_update',
      children: (
        <Fade>
          <OrderEdit key={key} {...props} {...cProps} />
        </Fade>
      )
    }
  ]

  const renderTabBar = (props, DefaultTabBar) => <DefaultTabBar {...props} />

  return (
    <>
      <Tabs
        destroyInactiveTabPane
        activeKey={activeTabKey}
        onChange={key => setActiveTabKey(key)}
        renderTabBar={renderTabBar}
        items={items}
      />

      <RefreshButton>
        <Button
          type="dashed"
          onClick={() => {
            getData()
            getOrderProducts()
          }}
          loading={fetching}
          icon={<ReloadOutlined />}
        >
          Refresh
        </Button>
      </RefreshButton>

      {order.video_guide ? <Video url={order.video_guide} /> : null}
    </>
  )
}

export default Manage

const RefreshButton = styled.div`
  position: fixed;
  top: 15px;
  right: 105px;
`
