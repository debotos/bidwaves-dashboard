export const localStorageKeys = {
  AUTH_TOKEN: `AUTH_TOKEN`,
  SHOW_SIDEBAR: `SHOW_SIDEBAR`,
  SIGNUP_DONE_NOW: 'SIGNUP_DONE_NOW',
  VIDEO_GUIDE_DB: 'VIDEO_GUIDE_DB',
  PENDING_CREATE_CAMPAIGN_DATA: 'PENDING_CREATE_CAMPAIGN_DATA',
  SHOW_PAYMENT_SUCCESS_PAGE: 'SHOW_PAYMENT_SUCCESS_PAGE'
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
  CLIENT_ORDER_PRODUCT_COMMON_BOOL_UPDATE: 'CLIENT_ORDER_PRODUCT_COMMON_BOOL_UPDATE', // Admin changes to client
  ORDER_PRODUCT_COMMON_BOOL_UPDATE: 'ORDER_PRODUCT_COMMON_BOOL_UPDATE', // Common changes
  CLIENT_ORDER_PRODUCT_REFETCH: 'CLIENT_ORDER_PRODUCT_REFETCH'
}

export const ORDER_NOTE_FROM_TYPE = { CSM: 'CSM', CLIENT: 'CLIENT' }

export const PRODUCT_TYPES = {
  google_tag: 'GOOGLE_TAG',
  website: 'WEBSITE',
  call_rail: 'CALL_RAIL',
  custom_graphics: 'CUSTOM_GRAPHICS',
  call_account_manager: 'CALL_ACCOUNT_MANAGER',
  analytics_setup: 'ANALYTICS_SETUP',
  google_shop_campaigns_setup: 'GOOGLE_SHOP_CAMPAIGNS_SETUP',
  crm_integration_with_unbounce: 'CRM_INTEGRATION_WITH_UNBOUNCE',
  bing_import_from_google: 'BING_IMPORT_FROM_GOOGLE'
}

const keys = {
  ...localStorageKeys,
  // const items from server
  IO_EVENTS,
  ORDER_STATUS,
  PRODUCT_TYPES,
  ORDER_NOTE_FROM_TYPE,
  ENUM_COL_PREFIX: '__enum_',
  BOOL_COL_PREFIX: '__bool_',
  EQUAL_TO_COL_PREFIX: '__equal_',
  NULL_COL_PREFIX: '__null_',
  // Others
  LOCAL_PREFIX: '__local_'
}

export default keys
