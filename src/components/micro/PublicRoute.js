import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

import { links } from 'config/vars'

export const PublicRoute = () => {
  const auth = useSelector(state => state.auth)

  return auth.isAuthenticated ? <Navigate to={links.orders.to} /> : <Outlet />
}

export default PublicRoute
