import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

import { links } from 'config/vars'
import AccountDisabled from './AccountDisabled'
import AccountNotActive from './AccountNotActive'

const PrivateRoute = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { active, disabled } = user ?? {}

  if (isAuthenticated && !active) return <AccountNotActive />
  if (isAuthenticated && disabled) return <AccountDisabled />

  return isAuthenticated ? <Outlet /> : <Navigate to={links.login.to} />
}

export default PrivateRoute
