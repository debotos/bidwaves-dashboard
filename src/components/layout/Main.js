import { Layout, Affix } from 'antd'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Header from './Header'
import Footer from './Footer'
import Sidenav from './Sidenav'

import { toggleSidebar } from 'redux/slices/themeSlice'

function Main() {
  const dispatch = useDispatch()
  const { showSidebar } = useSelector(state => state.theme)

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
        <div className="absolute z-50 md:relative md:shadow">
          <Affix offsetTop={0}>
            <Layout.Sider
              collapsible
              width={250}
              theme="light"
              trigger={null}
              collapsedWidth="0"
              collapsed={!showSidebar}
              className="app-bg"
            >
              <Sidenav />
            </Layout.Sider>
          </Affix>
        </div>

        <Layout className="app-bg flex min-h-screen flex-col">
          <Affix offsetTop={0}>
            <Layout.Header theme="light" className="app-bg h-16 px-4 shadow">
              <Header />
            </Layout.Header>
          </Affix>
          <Layout.Content className="app-bg flex-grow px-4 py-2">
            <Outlet />
          </Layout.Content>
          <Layout.Footer className="app-bg h-[48px] w-full px-4 py-3">
            <Footer />
          </Layout.Footer>
        </Layout>
      </Layout>
    </>
  )
}

export default Main
