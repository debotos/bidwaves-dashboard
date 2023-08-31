import React from 'react'
import { Result } from 'antd'

const AccountDisabled = () => {
  return (
    <div className={`fixed inset-0 z-50 flex h-screen items-center justify-center bg-[--body-bg-color]`}>
      <Result
        status="warning"
        title="Your account has been disabled."
        subTitle="Your account is no longer active and cannot be accessed."
        extra={
          <div className="mb-5 w-full max-w-3xl p-4">
            <h5>
              There are various reasons why your account may be disabled, such as a violation of the platform&apos;s
              terms of service, suspicious activity, or failure to comply with certain requirements.
            </h5>

            <h4 className="mt-4">
              You can <a href="https://www.bidwaves.com/contact/">contact</a> the platform&apos;s support team to
              inquire about the reason and to seek assistance in reactivating the account.
            </h4>
          </div>
        }
      />
    </div>
  )
}

export default React.memo(AccountDisabled)
