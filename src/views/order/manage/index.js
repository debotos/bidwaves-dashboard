import Axios from 'axios'
import styled from 'styled-components'
import { Button, Col, Row, Alert } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useSafeState, useMount, useUnmount, useUpdateEffect } from 'ahooks'

import keys from 'config/keys'
import { socketIO } from 'App'
import endpoints from 'config/endpoints'
import Video from 'components/micro/Video'
import handleError from 'helpers/handleError'
import { getErrorAlert, isEmpty } from 'helpers/utility'

import OrderNote from './note'
import OrderQA from './OrderQA'
import OrderEdit from './OrderEdit'
import OrderAssetList from './OrderAssetList'

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
      console.log(`Product response: `, data)
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

  const { editor_enabled } = order
  const cProps = { order, setOrder, updateOrder, fetching }

  if (order.done) {
    return <Alert message="This order has already been marked as complete!" type="success" showIcon />
  }

  return (
    <>
      <Row gutter={[20, 20]}>
        <Col span={24} md={14} lg={16} xl={17} xxl={20} key={key}>
          <OrderQA {...props} {...cProps} />
          {editor_enabled ? (
            <>
              <OrderEdit {...props} {...cProps} />
              <OrderAssetList {...props} {...cProps} />
            </>
          ) : null}
        </Col>
        <Col span={24} md={10} lg={8} xl={7} xxl={4}>
          <OrderNote {...props} {...cProps} />
        </Col>
      </Row>

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
