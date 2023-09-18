import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

import { toggleSidebar } from 'redux/slices/themeSlice'
import ProfileDropdown from 'components/micro/ProfileDropdown'

function Header() {
  const dispatch = useDispatch()
  const { showSidebar } = useSelector(state => state.theme)

  return (
    <div className="flex h-full items-center justify-between">
      <div className="mt-2">
        {React.createElement(showSidebar ? MenuFoldOutlined : MenuUnfoldOutlined, {
          style: { fontSize: 25 },
          onClick: () => dispatch(toggleSidebar())
        })}
      </div>

      <div>
        <ProfileDropdown />
      </div>
    </div>
  )
}

export default Header
