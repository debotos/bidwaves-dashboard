import { Alert, Button, Col, Empty, Row, Table } from 'antd'
import React from 'react'

import { getReadableCurrency, isEmpty } from 'helpers/utility'

function PaymentUI({ order }) {
  const { pending_payment_info } = order || {}
  if (isEmpty(pending_payment_info)) return <Empty />

  const { list, isRecurring } = pending_payment_info
  if (isEmpty(list) || !Array.isArray(list)) return <Alert message="Something went wrong." type="warning" showIcon />

  const total = (list || []).reduce((sum, x) => sum + Number(x?.price || 0), 0)

  const handlePay = () => {}

  return (
    <>
      <Row justify={`center`}>
        <Col span={24} md={24} lg={18} xl={14} xxl={10}>
          <h2 className="mt-3">{isRecurring ? 'Monthly Recurring Payment' : 'Payment'}</h2>
          <Table
            bordered
            size="small"
            dataSource={list}
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
              onClick={handlePay}
              type="primary"
              size="large"
              className="cta-btn"
            >
              {isRecurring ? 'Connect To Stripe' : 'Pay'}
            </Button>
          </Row>
          {isRecurring && <p className="text-center">Please note we charge on the 15th of every month.</p>}
        </Col>
      </Row>
    </>
  )
}

export default PaymentUI
