import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

import { links } from 'config/vars'
import AccountDisabled from './AccountDisabled'

const PrivateRoute = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { disabled } = user ?? {}

  if (isAuthenticated && disabled) return <AccountDisabled />

  return isAuthenticated ? <Outlet /> : <Navigate to={links.login.to} />
}

export default PrivateRoute
