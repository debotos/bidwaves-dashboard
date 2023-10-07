import Axios from 'axios'
import React from 'react'
import moment from 'moment'
import { useSafeState, useUpdateEffect } from 'ahooks'
import { FaLink, FaRegCreditCard } from 'react-icons/fa'
import { Button, Empty, Modal, Row, Space, Tag, Tooltip } from 'antd'

import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { getReadableCurrency, isEmpty, readableTime, renderLoading } from 'helpers/utility'

function PaymentInfo({ order }) {
  const { id: orderId } = order

  const [info, setInfo] = useSafeState(null)
  const [fetching, setFetching] = useSafeState(true)
  const [isModalOpen, setIsModalOpen] = useSafeState(false)

  const init = async () => {
    try {
      setFetching(true)
      const { data } = await Axios.get(endpoints.order(orderId) + `/payment-info`)
      window.log(`Payment info response -> `, data)
      setInfo(data)
    } catch (error) {
      handleError(error, true)
    } finally {
      setFetching(false)
    }
  }

  useUpdateEffect(() => {
    if (isModalOpen && isEmpty(info)) init()
  }, [isModalOpen])

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  if (isEmpty(order)) return null
  return (
    <>
      <Tooltip title="Payment Info">
        <Button icon={<FaRegCreditCard className="mt-1" />} size="small" onClick={showModal} />
      </Tooltip>

      <Modal title="Payment Information" footer={null} open={isModalOpen} onCancel={handleCancel}>
        {fetching ? (
          renderLoading({ className: 'my-5' })
        ) : (
          <OrderPaymentCard info={info} order={order} refetch={init} />
        )}
      </Modal>
    </>
  )
}

export default PaymentInfo

export const OrderPaymentCard = ({ info, refetch }) => {
  if (isEmpty(info)) {
    return (
      <>
        <Empty description="Something is wrong. Contact CMS." />
        <Row justify="center" className="mt-3">
          <Button onClick={() => refetch()}>Refetch Payment Details</Button>
        </Row>
      </>
    )
  }

  return (
    <>
      <Space direction="vertical" className="w-100">
        <div className="text-sm font-medium text-gray-500">{info.charge.description}</div>

        <Space size="small" className="text-sm font-medium text-gray-500">
          Last Paid:
          <Tag>
            <div className="text-sm font-medium text-gray-500">
              {readableTime(moment.unix(info.invoice.created), true)}
            </div>
          </Tag>
          <Tag>{getReadableCurrency(info.charge.amount / 100)}</Tag>
        </Space>

        {info.charge.receipt_url && (
          <Tooltip title="Receipt">
            <Button
              block
              className="mt-1"
              type="primary"
              icon={<FaLink />}
              onClick={() => window.open(info.charge.receipt_url, '_blank')}
            >
              View Full Details
            </Button>
          </Tooltip>
        )}
      </Space>
    </>
  )
}
