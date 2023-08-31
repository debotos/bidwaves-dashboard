import { useState } from 'react'

import MainUI from 'views/order/List'
import { Page } from 'components/micro/Common'

const Orders = () => {
  const [key, setKey] = useState('orders')

  const reRender = () => setKey(new Date().valueOf())

  return (
    <>
      <Page key={key}>
        <MainUI reRender={reRender} />
      </Page>
    </>
  )
}

export default Orders
