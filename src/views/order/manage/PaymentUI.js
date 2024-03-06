import React from 'react'
import { useSafeState } from 'ahooks'
import { Alert, Button, Col, Empty, Modal, Row, Table, message } from 'antd'

import { getReadableCurrency, isEmpty } from 'helpers/utility'
import OnetimeCheckoutForm from 'components/micro/OnetimeCheckoutForm'

function PaymentUI({ refetch, order }) {
  const { pending_payment_info } = order || {}
  const [modal, showModal] = useSafeState(false)
  if (isEmpty(pending_payment_info)) return <Empty />

  const { list } = pending_payment_info
  if (isEmpty(list) || !Array.isArray(list)) return <Alert message="Something went wrong." type="warning" showIcon />

  const total = (list || []).reduce((sum, x) => sum + Number(x?.price || 0), 0)

  return (
    <>
      <Row justify={`center`}>
        <Col span={24}>
          <h2 className="mt-3">{'Payment for setup costs'}</h2>
          <Table
            bordered
            rowKey="_serial"
            size="small"
            dataSource={list.map((x, i) => ({ ...x, _serial: i }))}
            pagination={false}
            className="w-100 mt-4"
            columns={[
              { title: 'Details', dataIndex: 'label', key: 'label', className: 'font-semibold text-lg' },
              {
                title: 'Cost',
                dataIndex: 'price',
                key: 'price',
                className: 'font-bold text-xl',
                align: 'end',
                fixed: 'left',
                render: value => {
                  if (isEmpty(value)) return null
                  return getReadableCurrency(value)
                }
              }
            ]}
          />
          <p className="mb-0 mt-3 text-end text-3xl">
            <b className="text-[--primary-color]">{getReadableCurrency(total)}</b>
          </p>
          <Row justify={`center`} className="my-4">
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
        <OnetimeCheckoutForm
          total={total}
          order={order}
          list={list}
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

export default PaymentUI
