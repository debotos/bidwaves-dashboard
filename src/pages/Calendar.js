import React from 'react'

import { Page } from 'components/micro/Common'
import PublicHeader from 'components/micro/PublicHeader'

function Calendar() {
  return (
    <>
      <div className="w-100 fixed top-0 z-10">
        <PublicHeader />
      </div>
      <Page>
        <div className={`pt-14 lg:pt-16`}>Calendar</div>
      </Page>
    </>
  )
}

export default Calendar
