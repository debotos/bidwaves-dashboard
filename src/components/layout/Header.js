import React from 'react'
import { Col, Grid, Row } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

import { Logo } from 'components/micro/Common'
import { toggleSidebar } from 'redux/slices/themeSlice'
import ProfileDropdown from 'components/micro/ProfileDropdown'
import { renderPublicLinks } from 'components/micro/PublicHeader'

const { useBreakpoint } = Grid

function Header() {
  const dispatch = useDispatch()
  const screens = useBreakpoint()
  const { showSidebar } = useSelector(state => state.theme)

  return (
    <Row className="h-full" justify="space-between" align="middle" wrap={false} gutter={[14, 0]}>
      <Col className="mt-1">
        {React.createElement(showSidebar ? MenuFoldOutlined : MenuUnfoldOutlined, {
          style: { fontSize: 25 },
          className: 'text-white',
          onClick: () => dispatch(toggleSidebar())
        })}
      </Col>

      {renderPublicLinks({ screens })}

      <Col className="lg:hidden">
        <Logo width={180} rowProps={{ className: '' }} light />
      </Col>

      <Col className="mb-1">
        <ProfileDropdown />
      </Col>
    </Row>
  )
}

export default Header
