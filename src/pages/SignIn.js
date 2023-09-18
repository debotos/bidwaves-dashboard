import Axios from 'axios'
import { useDispatch } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import React, { useState, useRef, useEffect } from 'react'
import { Row, Button, Form, Input, Typography, message, Col } from 'antd'
import { LockOutlined, LoginOutlined, MailOutlined } from '@ant-design/icons'

import keys from 'config/keys'
import { links } from 'config/vars'
import endpoints from 'config/endpoints'
import { isEmpty } from 'helpers/utility'
import { APP_ID, reloadChannel } from 'App'
import handleError from 'helpers/handleError'
import { Page, Logo } from 'components/micro/Common'
import { setCurrentUser } from 'redux/slices/authSlice'
import { setAxiosAuthHeaderToken } from 'helpers/axiosHelper'

function Login() {
  const dispatch = useDispatch()
  const _isMounted = useRef(false)
  const { state } = useLocation() // Pending Campaign Creation Data

  const [loading, setLoading] = useState(false)

  const onFinish = async values => {
    try {
      message.destroy('account-deleted')
      _isMounted.current && setLoading(true)
      const req = await Axios.post(endpoints.login, values)
      const res = req.data
      window.log(`Login response -> `, res)
      const { token, user } = res
      /* Set JWT to Axios header for authentication */
      setAxiosAuthHeaderToken(token)
      /* Store token to localStorage for future */
      localStorage.setItem(keys.AUTH_TOKEN, token)
      if (!isEmpty(state)) {
        try {
          const { data: order } = await Axios.post(endpoints.orderBase, { ...state, clientId: user.id })
          window.log(`Create campaign response -> `, order)
        } catch (error) {
          console.log('Create campaign error:', error)
        } finally {
          localStorage.removeItem(keys.PENDING_CREATE_CAMPAIGN_DATA)
        }
      }
      /* Update the auth state */
      dispatch(setCurrentUser(user))
      reloadChannel.postMessage(APP_ID)
    } catch (error) {
      handleError(error, true)
    } finally {
      _isMounted.current && setLoading(false)
    }
  }

  useEffect(() => {
    _isMounted.current = true
    return () => {
      _isMounted.current = false
    }
  }, [])

  return (
    <Page>
      <div className="flex h-screen items-center justify-center">
        <div className="mb-5 w-full max-w-md p-4">
          <Row justify="center" className="my-4">
            <Logo />
          </Row>

          <Typography.Title level={1}>Login</Typography.Title>

          <Form size="large" layout="vertical" name="login-form" onFinish={onFinish}>
            <Form.Item
              name="email"
              hasFeedback
              rules={[
                { whitespace: true, required: true, message: `Please input your email!` },
                { type: 'email', message: 'Provide valid email!' }
              ]}
            >
              <Input allowClear prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item name="password" hasFeedback rules={[{ required: true, message: 'Please input your password!' }]}>
              <Input.Password allowClear prefix={<LockOutlined />} type="password" placeholder="Password" />
            </Form.Item>

            <Row align="middle" justify="center" className="mt-4">
              <Button block type="primary" htmlType="submit" icon={<LoginOutlined />} loading={loading}>
                Login
              </Button>
            </Row>
          </Form>

          <Row justify="space-between" className="mt-3">
            <Col>
              <Link to={links.register.to} state={state}>
                <Button type="link" className="pl-0">
                  Create an account
                </Button>
              </Link>
            </Col>
            <Col>
              <Link to={links.forgotPassword.to} state={state}>
                <Button type="link" className="pr-0">
                  Forgot password?
                </Button>
              </Link>
            </Col>
          </Row>
        </div>
      </div>
    </Page>
  )
}

export default Login
