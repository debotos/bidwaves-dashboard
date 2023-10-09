import { notification } from 'antd'

import keys from 'config/keys'

/* Detail Error Log of AJAX req */
const handleError = (error, notify = false, filename, notificationProps = {}) => {
  console.log(error)
  if (filename) {
    console.log(`AJAX Req Error in ${filename}`)
  } else {
    console.log('AJAX Req Error')
  }
  console.log('===============Error Info==================')
  let title = 'ERROR'
  let msg = 'Something went wrong. Check your internet connection and try again!'
  let statusCode = null
  if (error.response) {
    statusCode = error.response.status
    const errorData = error.response?.data
    console.log('Error Data: ', errorData)
    console.log('Error Status Code: ', statusCode)
    console.log('Error Headers: ', error.response.headers)
    // Server responded with a status code that falls out of the range of 2xx
    if (errorData) {
      const { error: errorMsg, message } = errorData
      msg = errorMsg ?? message
    } else {
      title = 'Network Problem'
      msg = 'Please check your internet connection and try again.'
    }
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log('Error: no response was received\n------------------\n', error.request)
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error: setting up the request\n-------------------\n', error.message)
  }
  console.log('Error Config:\n-----------------\n', error.config)
  console.log('==============End Error Info=============')

  if (statusCode === 401) {
    // Remove token from local storage
    localStorage.removeItem(keys.ACCESS_TOKEN)
    // Kick to login page
    setTimeout(() => window.location.reload(), 2000)
  } else if (statusCode === 404) {
    title = `Not Found Error`
  }

  const finalMsg = msg.replace('ERROR Error:', '').replace('Error:', '')
  if (finalMsg && notify) {
    notification.error({
      message: title,
      description: finalMsg,
      duration: 8,
      ...notificationProps
    })
  }
  return { finalMsg, statusCode }
}

export default handleError
