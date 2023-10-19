import * as Excel from 'exceljs'
import { saveAs } from 'file-saver'

import store from 'redux/store'

const generateExcel = (data, name, columns, sheetName) => {
  /* Data Adjustment(if needed) */

  /* Set Workbook Properties */
  const workbook = new Excel.Workbook()
  workbook.creator = 'BidWaves Dashboard'
  workbook.lastModifiedBy = store.getState().auth.user?.email || 'Unknown User'
  workbook.created = new Date()
  workbook.modified = new Date()
  /* Workbook Views */
  workbook.views = [{ x: 0, y: 0, width: 10000, height: 20000, firstSheet: 0, activeTab: 1, visibility: 'visible' }]

  /* Add a worksheet */
  /* create new sheet with pageSetup settings for A4 - landscape */
  const worksheet = workbook.addWorksheet(sheetName ?? 'Sheet1', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  })

  /* Add columns */
  // window.log({ columns })
  worksheet.columns = columns.map(x => ({ header: x, key: x, width: 20 }))

  /* Add rows */
  worksheet.addRows(data)

  /* Download */
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `${name}.xlsx`)
  })
}

export default generateExcel
