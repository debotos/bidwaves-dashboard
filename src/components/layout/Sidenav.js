import React from 'react'
import { Menu } from 'antd'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import { isMobile } from 'helpers/utility'
import { Logo } from 'components/micro/Common'
import { privateRoutes } from 'config/vars'
import { toggleSidebar } from 'redux/slices/themeSlice'

function Sidenav() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()

  const closeNav = () => {
    if (!isMobile()) return
    dispatch(toggleSidebar())
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="h-16 bg-[--secondary-color]">
        <div className="flex h-full w-full items-center justify-center">
          <Logo width={180} rowProps={{ className: '' }} light />
        </div>
      </div>

      <div className="flex-1 overflow-y-scroll pt-3">
        <Menu
          theme="light"
          mode="inline"
          className=""
          selectedKeys={[location.pathname]}
          items={Object.keys({ ...privateRoutes })
            .filter(key => {
              const route = privateRoutes[key]
              return route.sidenav !== false
            })
            .map(key => {
              const route = privateRoutes[key]
              const icon = route.icon ? <route.icon style={{ fontSize: route.iconSize || 22 }} /> : null

              return {
                key: route.to,
                icon,
                label: route.label,
                className: `font-normal text-[#939393]`,
                onClick: () => {
                  closeNav()
                  navigate(route.to)
                }
              }
            })}
        />
      </div>
    </div>
  )
}

export default Sidenav
