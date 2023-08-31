import { createSlice } from '@reduxjs/toolkit'

const initialState = {}

/* Store overall app settings */
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings(settings, { payload }) {
      return { ...settings, ...payload }
    }
  }
})

export const { setSettings } = settingsSlice.actions

export default settingsSlice.reducer
