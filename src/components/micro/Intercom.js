import React from 'react'
import moment from 'moment'
import Intercom from 'react-intercom'
import styled from 'styled-components'
import { useSelector } from 'react-redux'

const cProps = {
  // eslint-disable-next-line no-undef
  appID: process.env.REACT_APP_INTERCOM_ID,
  alignment: 'right',
  api_base: 'https://api-iam.intercom.io'
}

function IntercomComponent() {
  const { isAuthenticated, user } = useSelector(state => state.auth)

  if (isAuthenticated && user) {
    const company_name = user.company?.name || user.email
    const userInfo = {
      email: user.email,
      name: user.first_name + ' ' + user.last_name,
      company: { company_id: company_name, name: company_name },
      ...(user.image ? { avatar: { type: 'avatar', image_url: user.image.secure_url } } : {}),
      created_at: moment(user.createdAt).valueOf()
    }

    return (
      <Wrapper>
        <Intercom {...userInfo} {...cProps} />
      </Wrapper>
    )
  }

  return null
}

export default React.memo(IntercomComponent)

const Wrapper = styled.div`
  z-index: 99999;
  position: fixed;
  bottom: 25px;
  right: 25px;

  @media screen and (max-width: 1024px) {
    bottom: 1rem;
    right: 1rem;
  }
`
