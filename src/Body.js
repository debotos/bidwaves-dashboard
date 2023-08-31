import Axios from 'axios'
import React from 'react'
import { message } from 'antd'
import jwt_decode from 'jwt-decode'
import { useDispatch } from 'react-redux'
import { useMount, useBoolean, useResetState, useUnmount } from 'ahooks'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import keys from 'config/keys'
import { socketIO } from 'App'
import { links } from 'config/vars'
import endpoints from 'config/endpoints'
import { getLoggedInUser } from 'redux/store'
import handleError from 'helpers/handleError'
import MainLayout from 'components/layout/Main'
import { getErrorAlert } from 'helpers/utility'
import Intercom from 'components/micro/Intercom'
import PublicRoute from 'components/micro/PublicRoute'
import PrivateRoute from 'components/micro/PrivateRoute'
import PageNotFound from 'components/micro/PageNotFound'
import { FullScreenLoading } from 'components/micro/Loading'
import { setAxiosAuthHeaderToken } from 'helpers/axiosHelper'
import { setCurrentUser, logoutUser } from 'redux/slices/authSlice'

const Profile = React.lazy(() => import('pages/Profile'))
const SignIn = React.lazy(() => import('pages/SignIn'))
const SignUp = React.lazy(() => import('pages/SignUp'))
const ForgotPassword = React.lazy(() => import('pages/ForgotPassword'))
const ResetPassword = React.lazy(() => import('pages/ResetPassword'))
const Products = React.lazy(() => import('pages/Products'))
const Orders = React.lazy(() => import('pages/Orders'))
const PR = React.lazy(() => import('pages/PR'))

function Body() {
  const dispatch = useDispatch()
  const [loading, { set: setLoading }] = useBoolean(true)
  const [state, setState, resetState] = useResetState({ error: null })

  const bootstrapApp = async () => {
    try {
      resetState()
      setLoading(true)
      /* Check for JSON WEB TOKEN */
      const jwt = localStorage.getItem(keys.AUTH_TOKEN)
      if (!jwt) return
      // Decode token and get user info and exp
      const user = jwt_decode(jwt)
      const currentTime = Date.now() / 1000
      // Check for expired token, if invalid remove from localStorage and exit
      if (user.exp < currentTime) return localStorage.removeItem(keys.AUTH_TOKEN)
      // Only Client is allowed
      if (user.type === 'ADMIN') {
        /* Token is invalid | Remove from localStorage */
        localStorage.removeItem(keys.AUTH_TOKEN)
      } else {
        /* Set JWT to Axios header for authentication */
        setAxiosAuthHeaderToken(jwt)
        /* Get user info & update redux store */
        const { data } = await Axios.get(endpoints.client(user.id))
        dispatch(setCurrentUser(data))
      }
    } catch (error) {
      const { finalMsg } = handleError(error)
      setState({ error: finalMsg })
    } finally {
      setLoading(false)
    }
  }

  const handleAccountDelete = info => {
    if (getLoggedInUser().id === info.id) {
      message.warning({
        key: 'account-deleted',
        content: `Sorry, You're account has been deleted.`,
        duration: 0,
        className: 'font-semibold text-[--warning-color]'
      })
      dispatch(logoutUser())
    }
  }

  const handleReload = info => {
    if (getLoggedInUser().id === info.id) {
      window.location.reload()
    }
  }

  const listenSocketIOEvents = () => {
    socketIO.on(keys.IO_EVENTS.CLIENT_DELETED, handleAccountDelete)
    socketIO.on(keys.IO_EVENTS.CLIENT_LOGOUT, handleReload)
  }

  const stopListeningSocketIOEvents = () => {
    socketIO.off(keys.IO_EVENTS.CLIENT_DELETED, handleAccountDelete)
    socketIO.off(keys.IO_EVENTS.CLIENT_LOGOUT, handleReload)
  }

  useMount(() => {
    bootstrapApp()
    listenSocketIOEvents()
  })

  useUnmount(() => {
    stopListeningSocketIOEvents()
  })

  if (loading) return <FullScreenLoading />
  if (state.error) return getErrorAlert({ fullScreen: true, msg: state.error, onRetry: bootstrapApp })

  return (
    <>
      <Router>
        <React.Suspense fallback={<FullScreenLoading msg="Loading Component..." />}>
          <Routes>
            {/* Public */}
            <Route element={<PublicRoute />}>
              <Route end path={links.login.to} element={<SignIn />} />
              <Route end path={links.register.to} element={<SignUp />} />
              <Route end path={links.forgotPassword.to} element={<ForgotPassword />} />
              <Route end path={links.resetPassword.to} element={<ResetPassword />} />
            </Route>

            {/* Private */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route end path={links.profile.to} element={<Profile />} />
                <Route end path={links.products.to} element={<Products />} />
                <Route end path={links.orders.to} element={<Orders />} />
                <Route end path={links.pr.to} element={<PR />} />
              </Route>
            </Route>

            {/* Not Found */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </React.Suspense>
      </Router>
      <Intercom />
    </>
  )
}

export default Body
