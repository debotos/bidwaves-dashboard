import { configureStore, combineReducers } from '@reduxjs/toolkit'

import authSlice from './slices/authSlice'
import themeSlice from './slices/themeSlice'
import settingsSlice from './slices/settingsSlice'

const rootReducer = combineReducers({
  settings: settingsSlice,
  theme: themeSlice,
  auth: authSlice
})

export const store = configureStore({
  reducer: rootReducer
})
export default store
export const getLoggedInUser = () => store.getState().auth.user ?? {}
