import React from 'react'
import { Space } from 'antd'
import { useNetwork } from 'ahooks'
import { MdSignalWifiStatusbarConnectedNoInternet } from 'react-icons/md'

import { getCssVar } from 'helpers/utility'

const CheckNetwork = () => {
  const networkState = useNetwork()
  const { online } = networkState

  if (online) return null

  return (
    <div className={`fixed inset-0 z-50 flex h-screen items-center justify-center bg-[--body-bg-color]`}>
      <Space direction="vertical" align="center" className="mb-5">
        <MdSignalWifiStatusbarConnectedNoInternet color={getCssVar('danger-color')} size={150} />
        <h5 className="text-lg font-semibold">You&apos;re not connected to the internet.</h5>
      </Space>
    </div>
  )
}

export default CheckNetwork
