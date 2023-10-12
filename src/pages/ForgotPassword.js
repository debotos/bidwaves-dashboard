import Axios from 'axios'
import React, { useState, useRef, useEffect } from 'react'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Row, Button, Form, Input, message, Col, Modal } from 'antd'

import { links } from 'config/vars'
import endpoints from 'config/endpoints'
import handleError from 'helpers/handleError'
import { Page, Logo } from 'components/micro/Common'

function ForgotPassword() {
  const navigate = useNavigate()
  const _isMounted = useRef(false)
  const { state } = useLocation() // Pending Campaign Creation Data

  const [loading, setLoading] = useState(false)

  const onFinish = async values => {
    try {
      message.destroy()
      _isMounted.current && setLoading(true)
      const { data } = await Axios.post(endpoints.passwordForgot, values)
      window.log(`Forgot Password Reset Req response -> `, data)
      Modal.success({
        title: 'Please check your mailbox!',
        content:
          'Password reset link sent successfully. Please remember, password reset link is only valid for 30 minutes after issuing.',
        onOk: () => {
          navigate(links.login.to, { replace: true })
        }
      })
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
          <Logo />

          <div className="mb-4 text-center">
            <h2>Forgot your password?</h2>
            <small className="mt-3 font-semibold">Enter your Email and we will send a password reset link.</small>
            <br />
            <small>Password reset link is only valid for 30 minutes after issuing.</small>
          </div>

          <Form size="large" layout="vertical" name="forgot-password-form" onFinish={onFinish}>
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

            <Row align="middle" justify="center" className="mt-4">
              <Button block type="primary" htmlType="submit" icon={<LockOutlined />} loading={loading}>
                Request Password Reset
              </Button>
            </Row>
          </Form>

          <Row justify="space-between" className="mt-3">
            <Col>
              <Link to={links.register.to} state={state}>
                <Button type="link" className="pl-0">
                  Sign Up
                </Button>
              </Link>
            </Col>
            <Col>
              <Link to={links.login.to} state={state}>
                <Button type="link" className="pr-0">
                  Sign In
                </Button>
              </Link>
            </Col>
          </Row>
        </div>
      </div>
    </Page>
  )
}

export default ForgotPassword
