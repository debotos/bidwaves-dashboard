import React from 'react'
import styled from 'styled-components'
import { useLocation } from 'react-router-dom'

import PublicHeader from 'components/micro/PublicHeader'

function Calendar() {
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)

  const url = searchParams.get('src')

  return (
    <>
      <div className="w-100 fixed top-0 z-10">
        <PublicHeader />
      </div>
      {url && (
        <>
          <Wrapper className={`min-h-screen pt-14 lg:pt-16`}>
            <iframe src={decodeURIComponent(url)} />
          </Wrapper>
        </>
      )}
    </>
  )
}

export default Calendar

export const Wrapper = styled.div`
  iframe {
    width: 100%;
    height: 100%;
    min-height: 100vh;
    border: none !important;
    outline: none !important;
  }
`
