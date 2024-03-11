import { useState } from 'react'

import MainUI from 'views/campaign/List'
import { Page } from 'components/micro/Common'

const Campaigns = () => {
  const [key, setKey] = useState('campaigns')

  const reRender = () => setKey(new Date().valueOf())

  return (
    <>
      <Page key={key}>
        <MainUI reRender={reRender} />
      </Page>
    </>
  )
}

export default Campaigns
