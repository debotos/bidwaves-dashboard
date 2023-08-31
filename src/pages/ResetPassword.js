import Axios from 'axios'
import jwt_decode from 'jwt-decode'
import { useDispatch } from 'react-redux'
import { useMount, useSafeState } from 'ahooks'
import { useLocation } from 'react-router-dom'
import { Button, Form, Input, message, Result, Row, Typography } from 'antd'
import { CloseCircleOutlined, LockOutlined, RedoOutlined } from '@ant-design/icons'

import keys from 'config/keys'
import endpoints from 'config/endpoints'
import { reloadChannel, APP_ID } from 'App'
import handleError from 'helpers/handleError'
import { basePasswordRule } from 'helpers/utility'
import { Logo, Page } from 'components/micro/Common'
import { setCurrentUser } from 'redux/slices/authSlice'
import { setAxiosAuthHeaderToken } from 'helpers/axiosHelper'

const { Paragraph, Text } = Typography

export default function ResetPassword() {
  const location = useLocation()
  const dispatch = useDispatch()
  const searchParams = new URLSearchParams(location.search)
  const token = searchParams.get('token')

  const [ok, setOk] = useSafeState(true)
  const [done, setDone] = useSafeState(false)
  const [loading, setLoading] = useSafeState(false)

  const onFinish = async values => {
    try {
      setLoading(true)
      const { data } = await Axios.patch(endpoints.passwordForgot, { token, password: values.password })
      window.log(`Reset Password Response -> `, data)
      setDone(true)
      const { token: newToken, user } = data
      /* Set JWT to Axios header for authentication */
      setAxiosAuthHeaderToken(newToken)
      /* Store token to localStorage for future */
      localStorage.setItem(keys.AUTH_TOKEN, newToken)
      setTimeout(() => {
        /* Update the auth state */
        dispatch(setCurrentUser(user))
        reloadChannel.postMessage(APP_ID)
      }, 2000)
    } catch (error) {
      setOk(false)
      handleError(error, true)
    } finally {
      setLoading(false)
    }
  }

  useMount(() => {
    try {
      if (!token) {
        setOk(false)
        message.error('Invalid link.')
        return
      }
      // Decode token and get payload
      const payload = jwt_decode(token)
      const currentTime = Date.now() / 1000
      // Check for expired token
      const { exp } = payload
      if (exp < currentTime) {
        setOk(false)
        message.error('Token expired.')
        return
      }
    } catch (error) {
      window.log(error)
      setOk(false)
      message.error('Something went wrong. Link / token may be altered.')
    }
  })

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className={`mb-5 w-full max-w-2xl p-4`}>
          <Logo rowProps={{ className: '' }} />
          <Result
            status="error"
            title="Invalid Link"
            subTitle={`Please check the link again from email and don't modify it.`}
          />
        </div>
      </div>
    )
  }

  return (
    <Page>
      <div className="flex h-screen items-center justify-center">
        <div className={`mb-5 w-full max-w-${!ok || (ok && done) ? '2xl' : 'md'} p-4`}>
          <Logo />

          {!ok && <NotOkayUI withLast={false} />}

          {ok && done && <SuccessUI />}

          {ok && !done && (
            <>
              <div className="mb-4 text-center">
                <h2>Reset your password?</h2>
                <small>Password reset link will expire in 30 minutes.</small>
              </div>

              <Form size="large" layout="vertical" name="reset-password-form" onFinish={onFinish}>
                <Form.Item name="password" rules={[basePasswordRule]}>
                  <Input.Password prefix={<LockOutlined />} allowClear placeholder="New Password" />
                </Form.Item>
                <Form.Item
                  name="confirm"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your Password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('The two passwords that you entered do not match!'))
                      }
                    })
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} allowClear placeholder="Confirm Password" />
                </Form.Item>
                <Row justify="end">
                  <Form.Item noStyle>
                    <Button type="primary" htmlType="submit" icon={<RedoOutlined />} loading={loading}>
                      Reset Password
                    </Button>
                  </Form.Item>
                </Row>
              </Form>
            </>
          )}
        </div>
      </div>
    </Page>
  )
}

export const NotOkayUI = () => {
  return (
    <Result status="error" title="Action Failed" subTitle={`Please check the link again and don't modify it.`}>
      <div className="desc">
        <Paragraph>
          <Text strong className="text-lg">
            The followings could be the possible reason:
          </Text>
        </Paragraph>
        <Paragraph>
          <CloseCircleOutlined className="mr-1 text-red-500" /> You modified the link / token.
        </Paragraph>
        <Paragraph>
          <CloseCircleOutlined className="mr-1 text-red-500" /> Your link is expired.
        </Paragraph>
      </div>
    </Result>
  )
}

export const SuccessUI = () => (
  <Result
    status="success"
    title="Action Successful"
    subTitle="Action successful and you can continue using the application."
  />
)
