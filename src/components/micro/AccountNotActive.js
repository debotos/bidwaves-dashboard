import React from 'react'
import { useSafeState } from 'ahooks'
import { useDispatch } from 'react-redux'
import { Button, Col, Result, Row } from 'antd'
import { LogoutOutlined, ReloadOutlined } from '@ant-design/icons'

import keys from 'config/keys'
import { logoutUser } from 'redux/slices/authSlice'

const AccountNotActive = () => {
  const dispatch = useDispatch()

  const getIsSignupNow = () => {
    const val = localStorage.getItem(keys.SIGNUP_DONE_NOW)
    localStorage.removeItem(keys.SIGNUP_DONE_NOW)
    if (!val) return false
    if (val === 'true') return true
    return false
  }

  const [now] = useSafeState(getIsSignupNow())

  return (
    <div className={`flex h-full w-full items-center justify-center bg-[--body-bg-color]`}>
      <Result
        status={now ? 'success' : 'info'}
        title={'Congratulations! Your account has been successfully created.'}
        extra={
          <div className="text-center">
            <>
              <h3>We will get back to you once your profile has been approved.</h3>
              <h4>If you don&apos;t receive the email, please check your spam folder.</h4>
            </>
            <Row justify="center" align="middle" gutter={[10, 0]} wrap={false} className="mt-5">
              <Col>
                <Button type="primary" onClick={() => window.location.reload()} icon={<ReloadOutlined />}>
                  Check Again
                </Button>
              </Col>
              <Col>
                <Button danger onClick={() => dispatch(logoutUser())} icon={<LogoutOutlined />}>
                  Logout
                </Button>
              </Col>
            </Row>
          </div>
        }
      />
    </div>
  )
}

export default React.memo(AccountNotActive)
