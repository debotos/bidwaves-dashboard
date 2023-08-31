import React from 'react'
import { Menu } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'

import { privateRoutes } from 'config/vars'
import { isMobile } from 'helpers/utility'
import { Logo } from 'components/micro/Common'
import { toggleSidebar } from 'redux/slices/themeSlice'

function Sidenav() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { showSidebar } = useSelector(state => state.theme)

  const closeNav = () => {
    if (!isMobile()) return
    dispatch(toggleSidebar())
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="h-16 bg-slate-200">
        <div className="flex h-full w-full items-center justify-center">
          <Logo width={180} rowProps={{ className: '' }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-scroll">
        <Menu
          theme="light"
          mode="inline"
          className="app-bg"
          selectedKeys={[location.pathname]}
          items={Object.keys(privateRoutes)
            .filter(x => privateRoutes[x].sidenav !== false)
            .map(key => {
              const route = privateRoutes[key]
              const icon = route.icon ? <route.icon style={{ fontSize: route.iconSize || 22 }} /> : null

              return {
                key: route.to,
                icon,
                label: route.label,
                className: `font-semibold`,
                onClick: () => {
                  closeNav()
                  navigate(route.to)
                }
              }
            })}
        />
      </div>

      <div
        className="flex h-14 cursor-pointer items-center justify-center bg-slate-200 hover:opacity-75 md:h-16"
        onClick={() => dispatch(toggleSidebar())}
      >
        {React.createElement(showSidebar ? LeftOutlined : RightOutlined, {
          style: { fontSize: 20 }
        })}
      </div>
    </div>
  )
}

export default Sidenav
