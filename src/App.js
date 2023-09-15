import { nanoid } from 'nanoid'
import io from 'socket.io-client'
import { Provider } from 'react-redux'
import { App, ConfigProvider } from 'antd'

import Body from 'Body'
import store from 'redux/store'
import { LOCAL_CHANNELS } from 'config/vars'
import { getAllCssVars } from 'helpers/utility'
import CheckNetwork from 'components/micro/CheckNetwork'
import ErrorBoundary from 'components/micro/ErrorBoundary'

import 'assets/styles/vars.css'
import 'assets/styles/main.css'

const getTheme = () => {
  const cssVars = getAllCssVars()
  return {
    token: {
      borderRadius: cssVars.baseBorderRadius,
      colorBgBase: '#fff',
      colorError: cssVars.dangerColor,
      colorInfo: cssVars.infoColor,
      colorPrimary: cssVars.primaryColor,
      colorSuccess: cssVars.successColor,
      colorTextBase: cssVars.textColor,
      colorWarning: cssVars.warnColor,
      fontFamily: cssVars.mainFontFamily,
      fontSize: cssVars.baseFontSize,
      colorPrimaryHover: cssVars.secondaryColor,
      controlItemBgActive: `${cssVars.secondaryColor}40`,
      controlHeightLG: 38
    }
  }
}

// eslint-disable-next-line no-undef
export const socketIO = io(process.env.REACT_APP_WS_ENDPOINT_BASE)
export const APP_ID = nanoid()
export const reloadChannel = new BroadcastChannel(LOCAL_CHANNELS.RELOAD)
reloadChannel.onmessage = excludeId => {
  if (excludeId && APP_ID !== excludeId) window.location.reload()
}

const Application = () => {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={getTheme()}>
        <App>
          <ApplicationInstance />
        </App>
      </ConfigProvider>
    </ErrorBoundary>
  )
}

let message
let notification
let modal

const ApplicationInstance = () => {
  const staticFunction = App.useApp()
  message = staticFunction.message
  modal = staticFunction.modal
  notification = staticFunction.notification

  return (
    <Provider store={store}>
      <Body />
      <CheckNetwork />
    </Provider>
  )
}

export default Application
export { message, notification, modal }
