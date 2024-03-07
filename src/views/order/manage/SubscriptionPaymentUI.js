import React from 'react'
import { useSafeState } from 'ahooks'
import { Button, Col, Modal, Row, message } from 'antd'

import { getReadableCurrency } from 'helpers/utility'
import RecurringCheckoutForm from 'components/micro/RecurringCheckoutForm'

function SubscriptionPaymentUI({ refetch, order, subscriptionAmount }) {
  const [modal, showModal] = useSafeState(false)

  return (
    <>
      <Row justify={`center`}>
        <Col span={24}>
          <h2 className="">{'Monthly Subscription Payment'}</h2>
          <p>
            Ensure uninterrupted access to our services with hassle-free monthly payments. Your subscription fee will be
            automatically charged to your preferred payment method each month, simplifying your experience while
            enjoying our offerings.
          </p>
          <p className="my-4 mb-0 text-center text-4xl">
            <b className="text-[--primary-color]">{getReadableCurrency(subscriptionAmount)}</b>
          </p>
          <Row justify={`center`} className="">
            <Button
              loading={false}
              disabled={false}
              shape="round"
              onClick={() => showModal(true)}
              type="primary"
              size="large"
              className="cta-btn"
            >
              Pay on Stripe
            </Button>
          </Row>
        </Col>
      </Row>
      <Modal
        destroyOnClose
        title="Payment Details"
        maskClosable={false}
        open={modal}
        footer={null}
        onCancel={() => showModal(false)}
      >
        <RecurringCheckoutForm
          total={subscriptionAmount}
          order={order}
          onComplete={() => {
            message.success('Payment successful!')
            showModal(false)
            refetch()
          }}
        />
      </Modal>
    </>
  )
}

export default SubscriptionPaymentUI
