import React from 'react'
import styled from 'styled-components'

function Stats({ url }) {
  return (
    <>
      <Wrapper className={`h-full pt-3`}>{url && <iframe src={url}></iframe>}</Wrapper>
    </>
  )
}

export default Stats

export const Wrapper = styled.div`
  iframe {
    width: 100%;
    height: 100%;
    border: none !important;
    outline: none !important;
  }
`
