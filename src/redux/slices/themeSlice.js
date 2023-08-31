import { createSlice } from '@reduxjs/toolkit'

import keys from 'config/keys'
import { isMobile } from 'helpers/utility'

const initialState = {
  showSidebar: isMobile()
    ? false
    : !localStorage.getItem(keys.SHOW_SIDEBAR)
    ? true
    : localStorage.getItem(keys.SHOW_SIDEBAR) === 'true'
}

/* Store UI config provided by api */
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeData(theme, { payload }) {
      return { ...theme, ...payload }
    },

    toggleSidebar(theme) {
      const newVal = !theme.showSidebar
      !isMobile() && localStorage.setItem(keys.SHOW_SIDEBAR, newVal === true)
      return { ...theme, showSidebar: newVal }
    }
  }
})

export const { setThemeData, toggleSidebar } = themeSlice.actions

export default themeSlice.reducer
