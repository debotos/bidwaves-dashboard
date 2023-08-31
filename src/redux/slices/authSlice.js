import { createSlice } from '@reduxjs/toolkit'

import keys from 'config/keys'
import { isEmpty } from 'helpers/utility'
import { APP_ID, reloadChannel } from 'App'
import { setAxiosAuthHeaderToken } from 'helpers/axiosHelper'

const initialState = { isAuthenticated: false, user: null }

/* Store auth state */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser(state, { payload }) {
      return { ...state, isAuthenticated: !isEmpty(payload), user: payload }
    },
    logoutUser() {
      reloadChannel.postMessage(APP_ID)
      /* Remove JWT from Axios header */
      setAxiosAuthHeaderToken(null)
      /* Delete 'AUTH_TOKEN' from localStorage */
      localStorage.removeItem(keys.AUTH_TOKEN)
      /* Set isAuthenticated: false & user: null */
      return { ...initialState }
    }
  }
})

export const { setCurrentUser, logoutUser } = authSlice.actions

export default authSlice.reducer
