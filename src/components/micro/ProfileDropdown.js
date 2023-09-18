import React from 'react'
import { Avatar, Dropdown } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa'

import { logoutUser } from 'redux/slices/authSlice'

function ProfileDropdown() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
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

  const image_url = loggedInUser.image?.secure_url

  return (
    <Dropdown menu={{ items }}>
      <Avatar className={`cursor-pointer ${image_url ? '' : 'border border-white'}`} src={image_url}>
        {loggedInUser.first_name[0].toUpperCase()}
      </Avatar>
    </Dropdown>
  )
}

export default ProfileDropdown
