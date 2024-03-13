import { useState } from 'react'

import MainUI from 'views/billing/List'
import { Page } from 'components/micro/Common'

const Billings = () => {
  const [key, setKey] = useState('billings')

  const reRender = () => setKey(new Date().valueOf())

  return (
    <>
      <Page key={key}>
        <MainUI reRender={reRender} />
      </Page>
    </>
  )
}

export default Billings
