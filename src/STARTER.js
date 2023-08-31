import React from 'react'
import Axios from 'axios'
import { Card } from 'antd'
import { useSafeState, useMount } from 'ahooks'

import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { getErrorAlert, isEmpty, renderLoading } from 'helpers/utility'

function CustomTemplateStarter() {
  const [schema, setSchema] = useSafeState(null)
  const [fetching, setFetching] = useSafeState(false)

  const getData = async () => {
    try {
      setFetching(true)
      const ep = endpoints.order('')
      const req = await Axios.get(ep)
      const res = req.data || {}
      console.log(`Page response: `, res)
      setSchema(res)
    } catch (error) {
      handleError(error, true)
    } finally {
      setFetching(false)
    }
  }

  useMount(() => {
    getData()
  })

  if (fetching) return renderLoading({ tip: 'Loading Schema...', className: 'my-4' })
  if (isEmpty(schema)) return getErrorAlert({ onRetry: getData })

  return (
    <>
      <Card>Custom Starter</Card>
    </>
  )
}

export default CustomTemplateStarter
