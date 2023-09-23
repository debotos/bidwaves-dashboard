export const localStorageKeys = {
  AUTH_TOKEN: `AUTH_TOKEN`,
  SHOW_SIDEBAR: `SHOW_SIDEBAR`,
  SIGNUP_DONE_NOW: 'SIGNUP_DONE_NOW',
  VIDEO_GUIDE_DB: 'VIDEO_GUIDE_DB',
  PENDING_CREATE_CAMPAIGN_DATA: 'PENDING_CREATE_CAMPAIGN_DATA'
}

export const ORDER_STATUS = {
  PROGRESS: 'Setup In Progress',
  AWAITING_PAYMENT: 'Awaiting For Payment',
  CANCELLED: 'Cancelled',
  WAITING: 'Waiting For Review',
  REFUNDING: 'Refund In Progress',
  ALL_GOOD: 'All Good',
  RUNNING: 'Running'
}

export const IO_EVENTS = {
  CLIENT_DELETED: 'CLIENT_DELETED',
  CLIENT_LOGOUT: 'CLIENT_LOGOUT',
  CLIENT_REFETCH_ORDER: 'CLIENT_REFETCH_ORDER',
  REFETCH_ORDER_PRODUCTS: 'REFETCH_ORDER_PRODUCTS',
  ORDER_PRODUCT_DELETED: 'ORDER_PRODUCT_DELETED',
  CLIENT_ORDER_PRODUCT_COMPLETE: 'CLIENT_ORDER_PRODUCT_COMPLETE'
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
