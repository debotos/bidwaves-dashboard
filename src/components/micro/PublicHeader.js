import { useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Col, Row, Grid, Space } from 'antd'

import { links } from 'config/vars'
import { Logo } from 'components/micro/Common'
import ProfileDropdown from './ProfileDropdown'

const { useBreakpoint } = Grid

const linkHome = `https://www.bidwaves.com/`
const anchors = [
  { label: 'Home', link: linkHome },
  { label: 'How it Works', link: linkHome + `/how-it-works` },
  { label: 'About Us', link: linkHome + `/about-us` },
  { label: 'Book a Demo', link: linkHome + `/book-a-demo` }
]

export const renderPublicLinks = ({ screens, direction, showAlways, size, spaceProps = {} } = {}) => {
  return (
    <Col className={showAlways ? '' : 'hidden lg:block'}>
      <Space size={size ?? (screens?.lg ? 50 : 30)} direction={direction} {...spaceProps}>
        {anchors.map((anchor, i) => {
          return (
            <a key={i} rel="noreferrer" target="_blank" href={anchor.link} className="within">
              {anchor.label}
            </a>
          )
        })}
      </Space>
    </Col>
  )
}

const PublicHeader = () => {
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const location = useLocation()

  const isSignInPage = location.pathname === links.login.to
  const { isAuthenticated } = useSelector(state => state.auth)

  const buttonSize = screens.lg ? 'large' : 'default'

  return (
    <>
      <div className="bg-[--secondary-color]">
        <div className="w-100 container mx-auto flex h-14 items-center lg:h-16">
          <Row className="w-100 h-full px-4 sm:px-0" justify="space-between" align="middle">
            <Col>
              <Logo light={true} width={150} rowProps={{ className: '' }} onClick={() => navigate(links.orders.to)} />
            </Col>
            {renderPublicLinks({ screens })}
            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <Col>
                <Link to={isSignInPage ? links.register.to : links.login.to}>
                  <Button type="default" shape="round" size={buttonSize} className="font-semibold">
                    Sign {isSignInPage ? 'Up' : 'In'}
                  </Button>
                </Link>
              </Col>
            )}
          </Row>
        </div>
      </div>
    </>
  )
}

export default PublicHeader
