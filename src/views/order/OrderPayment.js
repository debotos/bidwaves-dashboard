import Axios from 'axios'
import React from 'react'
import { useUpdateEffect, useSafeState } from 'ahooks'
import { FaRegCreditCard, FaLink } from 'react-icons/fa'
import { Button, Divider, Empty, Modal, Row, Space, Spin, Tooltip, Typography } from 'antd'

import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { getReadableCurrency, isEmpty, readableTime } from 'helpers/utility'

function OrderPayment({ order, onOrderUpdate }) {
  const { id: orderId, productId } = order
  const [loading, setLoading] = useSafeState(true)
  const [log, setLog] = useSafeState(null)
  const [product, setProduct] = useSafeState(null)
  const [isModalOpen, setIsModalOpen] = useSafeState(false)

  const init = async () => {
    try {
      setLoading(true)
      const { data: product } = await Axios.get(endpoints.product(productId))
      setProduct(product)
      const { data } = await Axios.get(endpoints.orderPaymentBase(orderId))
      window.log(`Payment log response -> `, data)
      setLog(data)
    } catch (error) {
      handleError(error, true)
    } finally {
      setLoading(false)
    }
  }

  useUpdateEffect(() => {
    if (isModalOpen && isEmpty(log)) init()
  }, [isModalOpen])

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Tooltip title="Payment Info">
        <Button icon={<FaRegCreditCard className="mt-1" />} size="small" onClick={showModal} />
      </Tooltip>

      <Modal title="Payment Information" footer={null} open={isModalOpen} onCancel={handleCancel}>
        {loading ? (
          <Row justify="center" className="my-5">
            <Spin />
          </Row>
        ) : (
          <OrderPaymentCard log={log} order={order} product={product} refetch={init} onOrderUpdate={onOrderUpdate} />
        )}
      </Modal>
    </>
  )
}

export default OrderPayment

export const OrderPaymentCard = ({ log, order }) => {
  if (isEmpty(log)) {
    return (
      <>
        <Empty
          description={
            <>
              Not paid! <br /> You can{' '}
              <a target="_blank" href="https://www.bidwaves.com/contact/" rel="noreferrer">
                contact
              </a>{' '}
              the platform&apos;s support team to inquire.
              <br />
              <Space align="center">
                <span>Order ID:</span>
                <Typography.Paragraph className="m-0" copyable>
                  {order.id}
                </Typography.Paragraph>
              </Space>
            </>
          }
        />
      </>
    )
  }

  const coupons = log.meta_data?.coupons || []

  return (
    <>
      <Space direction="vertical" className="w-100">
        <div className="text-sm font-medium text-gray-500">{readableTime(log.createdAt, true)}</div>
        {!isEmpty(log.meta_data) && (
          <>
            <div className="text-sm font-medium text-gray-500">
              {log.meta_data.brand?.toUpperCase()} **** {log.meta_data.last4}
            </div>
          </>
        )}
        <div className="text-sm font-medium text-gray-500">{log.description}</div>
        <Space size="small" split={<Divider type="vertical" />} className="text-sm font-medium text-gray-500">
          {getReadableCurrency(log.amount)}
          <span className="text-sm font-medium text-green-600">Paid</span>
          {log.meta_data.receipt_url && (
            <Tooltip title="Receipt">
              <Button size="small" icon={<FaLink />} onClick={() => window.open(log.meta_data.receipt_url, '_blank')} />
            </Tooltip>
          )}
        </Space>

        {!isEmpty(coupons) && Array.isArray(coupons) ? (
          <>
            <Space direction="vertical" size={3} className="w-100 text-sm font-medium text-gray-500">
              <Divider plain dashed className="mb-2">
                <div className="text-sm font-bold text-gray-500">Coupons Used</div>
              </Divider>
              <div className="grid grid-cols-2 gap-y-2">
                {coupons.map((x, i) => {
                  return (
                    <React.Fragment key={i}>
                      <div className="bg-gray-100 p-2 text-center">
                        <span className="text-sm font-semibold text-gray-500">{x.code}</span>
                      </div>
                      <div className="bg-gray-100 p-2 text-center">
                        <span className="text-sm font-medium text-gray-500">{getReadableCurrency(x.amount)}</span>{' '}
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>
            </Space>
          </>
        ) : null}
      </Space>
    </>
  )
}
