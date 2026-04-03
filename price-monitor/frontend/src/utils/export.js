import * as XLSX from 'xlsx'

export const exportToExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export const exportToCSV = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
}

export const formatPrice = (price) => {
  if (price === null || price === undefined) return 'N/A'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(price)
}

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
