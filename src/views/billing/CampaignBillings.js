import Axios from 'axios'
import React from 'react'
import { FaFilePdf } from 'react-icons/fa'
import { useSafeState, useMount } from 'ahooks'
import { Empty, Space, Alert, Table, Button, Tooltip } from 'antd'

import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { OneTimePaymentCard } from 'views/order/CampaignItem'
import { getReadableCurrency, isEmpty, readableTime, renderLoading } from 'helpers/utility'

function CampaignBillings({ campaign }) {
  const { id: orderId } = campaign
  const [info, setInfo] = useSafeState(null)
  const [fetching, setFetching] = useSafeState(true)

  const init = async () => {
    try {
      setFetching(true)
      const { data } = await Axios.get(endpoints.info + `/${orderId}/billings`)
      window.log(`Stats response -> `, data)
      setInfo(data)
    } catch (error) {
      handleError(error, true)
    } finally {
      setFetching(false)
    }
  }

  useMount(() => {
    init()
  })

  if (isEmpty(campaign)) return null
  if (fetching) return renderLoading({ className: 'my-5' })
  if (isEmpty(info)) return <Empty />

  const { fees, subscriptions } = info

  return (
    <Space direction="vertical" size="large" className="w-100 p-5">
      <div>
        <h4 className="mb-3">One Time Payments</h4>
        {isEmpty(fees) ? (
          <Empty />
        ) : (
          <Space size="small" wrap>
            {fees.map((payment, i) => {
              return <Alert key={i} type="info" description={<OneTimePaymentCard log={payment} />} />
            })}
          </Space>
        )}
      </div>
      <div>
        <h3 className="mb-3">Subscription Payments</h3>
        {isEmpty(subscriptions) ? (
          <Empty />
        ) : (
          <>
            <Table
              bordered={true}
              size="small"
              dataSource={subscriptions.map((x, i) => ({ ...x, key: i }))}
              pagination={false}
              className="py-3"
              scroll={{ x: 'max-content' }}
              columns={[
                {
                  title: 'Date',
                  key: 'date',
                  dataIndex: 'date',
                  render: value => {
                    if (isEmpty(value)) return null
                    return readableTime(value, true)
                  }
                },
                {
                  title: 'Amount',
                  key: 'amount',
                  align: 'right',
                  dataIndex: 'amount',
                  render: value => {
                    if (isEmpty(value)) return null
                    return getReadableCurrency(value)
                  }
                },
                {
                  title: 'Currency',
                  key: 'currency',
                  align: 'center',
                  dataIndex: 'currency',
                  render: value => {
                    if (isEmpty(value)) return null
                    return value.toUpperCase()
                  }
                },
                {
                  title: 'PDF',
                  key: 'pdf',
                  dataIndex: 'pdf',
                  align: 'center',
                  render: value => {
                    if (isEmpty(value)) return null
                    return (
                      <Tooltip title="Download PDF">
                        <Button
                          size="small"
                          icon={<FaFilePdf />}
                          onClick={e => {
                            e.stopPropagation()
                            window.open(value, '_blank')
                          }}
                        />
                      </Tooltip>
                    )
                  }
                }
              ]}
            />
          </>
        )}
      </div>
    </Space>
  )
}

export default CampaignBillings
