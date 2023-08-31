import React from 'react'
import { Button, Result } from 'antd'
import { Link } from 'react-router-dom'

import vars from 'config/vars'

const PageNotFound = () => {
  return (
    <div className={`fixed inset-0 z-50 flex h-screen items-center justify-center bg-[--body-bg-color]`}>
      <Result
        status="404"
        title="404"
        subTitle={`Page not found.`}
        extra={
          <Link to={`${vars.links.orders.to}`}>
            <Button type="primary" className="font-semibold">
              Go Back
            </Button>
          </Link>
        }
      />
    </div>
  )
}

export default React.memo(PageNotFound)
