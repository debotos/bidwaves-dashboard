import Axios from 'axios'
import React from 'react'
import { useSafeState, useMount } from 'ahooks'
import { Empty, Table } from 'antd'

import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { isEmpty, renderLoading } from 'helpers/utility'

function CampaignStats({ campaign }) {
  const { id: orderId } = campaign
  const [info, setInfo] = useSafeState(null)
  const [fetching, setFetching] = useSafeState(true)

  const init = async () => {
    try {
      setFetching(true)
      const { data } = await Axios.get(endpoints.info + `/${orderId}/stats`)
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

  return (
    <>
      <Table
        bordered={true}
        size="small"
        dataSource={[{ key: 1 }]}
        pagination={false}
        className="py-3"
        scroll={{ x: 'max-content' }}
        columns={[
          ...info.map(x => {
            const numberType = x.value.type === 'numberValue'
            return {
              title: x.label,
              key: x.label,
              // align: numberType ? 'right' : undefined,
              dataIndex: x.label,
              className: 'font-bold',
              render: () => {
                const val = x.value.formattedValue
                if (numberType) return x.value.numberValue?.toLocaleString?.() ?? val
                return val
              }
            }
          })
        ]}
      />
    </>
  )
}

export default CampaignStats
