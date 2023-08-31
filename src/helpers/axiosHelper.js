import axios from 'axios'

axios.defaults.crossDomain = true

const tokenKey = 'x-client-token'
export const setAxiosAuthHeaderToken = token => {
  if (token) {
    // Apply to every request
    window.log(`Setting up "${tokenKey}" header to Axios!`)
    axios.defaults.headers.common[tokenKey] = token
  } else {
    // Delete auth header
    window.log(`Deleting "${tokenKey}" header to Axios!`)
    delete axios.defaults.headers.common[tokenKey]
  }
}
