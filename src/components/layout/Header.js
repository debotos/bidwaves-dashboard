import React from 'react'
import { Avatar, Dropdown } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

import { logoutUser } from 'redux/slices/authSlice'
import { toggleSidebar } from 'redux/slices/themeSlice'

function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { showSidebar } = useSelector(state => state.theme)
  const { user: loggedInUser } = useSelector(state => state.auth)

  const items = [
    {
      label: 'Profile',
      icon: <FaUserCircle size={18} />,
      key: 'profile',
      onClick: () => navigate('/profile')
    },
    { type: 'divider' },
    {
      label: 'Logout',
      danger: true,
      icon: <FaSignOutAlt size={18} />,
      key: 'logout',
      onClick: () => {
        dispatch(logoutUser())
      }
    }
  ]

  return (
    <div className="flex h-full items-center justify-between">
      <div className="mt-2">
        {React.createElement(showSidebar ? MenuFoldOutlined : MenuUnfoldOutlined, {
          style: { fontSize: 25 },
          onClick: () => dispatch(toggleSidebar())
        })}
      </div>

      <div>
        <Dropdown menu={{ items }}>
          <Avatar className="cursor-pointer" src={loggedInUser.image?.secure_url}>
            {loggedInUser.first_name[0].toUpperCase()}
          </Avatar>
        </Dropdown>
      </div>
    </div>
  )
}

export default Header
