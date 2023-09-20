import Axios from 'axios'
import styled from 'styled-components'
import loadable from '@loadable/component'
import { Button, Col, Row, Alert, Tabs } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useSafeState, useMount, useUnmount, useUpdateEffect } from 'ahooks'

import keys from 'config/keys'
import { socketIO } from 'App'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { getErrorAlert, isEmpty } from 'helpers/utility'
import { loadableOptions } from 'components/micro/Common'

const OrderNote = loadable(() => import('./note'), loadableOptions)
const OrderQA = loadable(() => import('./OrderQA'), loadableOptions)
const OrderEdit = loadable(() => import('./OrderEdit'), loadableOptions)
const Video = loadable(() => import('components/micro/Video'), loadableOptions)
// const OrderAssetList = loadable(() => import('./OrderAssetList'), loadableOptions)
const ProductSuggestion = loadable(() => import('./suggestion/ProductSuggestion'), loadableOptions)

const Manage = props => {
  const { order: initialOrder } = props
  const orderId = initialOrder.id
  const [key, setKey] = useSafeState('order')
  const [fetching, setFetching] = useSafeState(true)
  const [order, setOrder] = useSafeState(initialOrder)

  const reRender = () => setKey(new Date().valueOf())
  const updateOrder = (updates = {}) => setOrder(prevValues => ({ ...prevValues, ...updates }))

  const getData = async () => {
    try {
      setFetching(true)
      const ep = endpoints.order(orderId)
      const { data } = await Axios.get(ep)
      console.log(`Order/Campaign response: `, data)
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

  const cProps = { order, setOrder, updateOrder, fetching, refetch: getData }

  if (order.done) {
    return <Alert message="This campaign has already been marked as complete!" type="success" showIcon />
  }

  const noQA = isEmpty(order.qa)
  const QA_UI = <OrderQA {...props} {...cProps} />

  if (!order.qa_approved && !noQA)
    return (
      <>
        <Alert
          className="mb-3"
          message={
            <>
              Please <b>submit</b> the answer of this below questions to get started.
            </>
          }
          type="info"
          showIcon
        />
        {QA_UI}
      </>
    )

  const items = [
    {
      label: 'Campaign Manager',
      key: 'campaign_manager',
      children: (
        <>
          <Row gutter={[20, 20]}>
            <Col span={24} md={14} lg={16} xl={17} xxl={20} key={key}></Col>
            <Col span={24} md={10} lg={8} xl={7} xxl={4}>
              <OrderNote {...props} {...cProps} />
            </Col>
          </Row>
        </>
      )
    },
    ...(noQA ? [] : [{ label: 'Campaign QA', key: 'campaign_qa', children: QA_UI }]),
    {
      label: 'Product Suggestion',
      key: 'product_suggestion',
      children: <ProductSuggestion {...props} {...cProps} />
    },
    {
      label: 'Campaign Update',
      key: 'campaign_update',
      children: <OrderEdit key={key} {...props} {...cProps} />
    }
  ]

  const renderTabBar = (props, DefaultTabBar) => <DefaultTabBar {...props} />

  return (
    <>
      <Tabs defaultActiveKey={items[0].key} destroyInactiveTabPane renderTabBar={renderTabBar} items={items} />

      <RefreshButton>
        <Button type="dashed" onClick={getData} loading={fetching} icon={<ReloadOutlined />}>
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
