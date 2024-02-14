import { Layout, Affix } from 'antd'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Header from './Header'
import Footer from './Footer'
import Sidenav from './Sidenav'

import { toggleSidebar } from 'redux/slices/themeSlice'
// import { renderPublicLinks } from 'components/micro/PublicHeader'
import AccountNotActive from 'components/micro/AccountNotActive'

function Main() {
  const dispatch = useDispatch()
  const { showSidebar } = useSelector(state => state.theme)
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { active } = user ?? {}

  const renderBackdrop = () => {
    return (
      <div
        className={`fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ${
          showSidebar ? 'pointer-events-auto z-50 opacity-100' : 'pointer-events-none opacity-0'
        } md:hidden`}
        onClick={() => dispatch(toggleSidebar())}
      />
    )
  }

  return (
    <>
      {renderBackdrop()}
      <Layout hasSider className="app-bg">
        <div className="absolute z-50 md:relative">
          <Affix offsetTop={0}>
            <Layout.Sider
              collapsible
              width={270}
              theme="light"
              trigger={null}
              collapsedWidth="0"
              collapsed={!showSidebar}
              className="bg-white"
            >
              <Sidenav />
            </Layout.Sider>
          </Affix>
        </div>

        <Layout className="app-bg flex min-h-screen flex-col">
          <Affix offsetTop={0}>
            <Layout.Header theme="light" className="h-16 bg-[--secondary-color] px-5">
              <Header />
            </Layout.Header>
          </Affix>
          <Layout.Content className="app-bg flex-grow px-5 py-2">
            {isAuthenticated && !active ? <AccountNotActive /> : <Outlet />}
          </Layout.Content>
          {/* <div className="flex justify-center bg-[--secondary-color] p-6 lg:hidden">
            {renderPublicLinks({ spaceProps: { direction: 'vertical', size: 16, align: 'center' }, showAlways: true })}
          </div> */}
          <Layout.Footer className="app-bg h-[48px] w-full px-5 py-3">
            <Footer />
          </Layout.Footer>
        </Layout>
      </Layout>
    </>
  )
}

export default Main
