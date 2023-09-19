export const localStorageKeys = {
  AUTH_TOKEN: `AUTH_TOKEN`,
  SHOW_SIDEBAR: `SHOW_SIDEBAR`,
  SIGNUP_DONE_NOW: 'SIGNUP_DONE_NOW',
  VIDEO_GUIDE_DB: 'VIDEO_GUIDE_DB',
  PENDING_CREATE_CAMPAIGN_DATA: 'PENDING_CREATE_CAMPAIGN_DATA'
}

export const ORDER_STATUS = {
  PROGRESS: 'In Progress',
  CANCELLED: 'Cancelled',
  WAITING: 'Waiting For Review',
  REFUNDING: 'Refund In Progress',
  RUNNING: 'Running',
  ALL_GOOD: 'All Good'
}

export const IO_EVENTS = {
  CLIENT_DELETED: 'CLIENT_DELETED',
  CLIENT_LOGOUT: 'CLIENT_LOGOUT',
  CLIENT_REFETCH_ORDER: 'CLIENT_REFETCH_ORDER'
}

export const ORDER_NOTE_FROM_TYPE = { CSM: 'CSM', CLIENT: 'CLIENT' }

const keys = {
  ...localStorageKeys,
  // const items from server
  IO_EVENTS,
  ORDER_STATUS,
  ORDER_NOTE_FROM_TYPE,
  ENUM_COL_PREFIX: '__enum_',
  BOOL_COL_PREFIX: '__bool_',
  EQUAL_TO_COL_PREFIX: '__equal_',
  NULL_COL_PREFIX: '__null_',
  // Others
  LOCAL_PREFIX: '__local_'
}

export default keys
