import { Timestamp } from 'firebase/firestore'

export function monthYear(date) {
  const [year, month] = date.split('-')
  const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' })
  return `${monthName} ${year}` // Dec 2022
}

export function monthDay(date) {
  const seconds = date.split('T')[1]
  const dateObj = new Date(seconds * 1000)
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) // Dec 10
}

export function shortMonthDayTime(timestamp) {
  const date = timestamp ? new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000) : new Date()

  return date
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })
    .split(', ')
    .join(' - ') // Dec 10 - 14:18
}

export function currentYearMonth() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }).split('/').reverse().join('-') // 2022-11
}

export function previousYearMonth() {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)

  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }).split('/').reverse().join('-') // 2022-10
}

export function getDay(intDate) {
  const date = new Date()
  date.setTime(intDate)
  return new Date(date.getFullYear(), date.getMonth(), date.getDay()).getTime()
}
export function getNextDay(intDate) {
  const date = new Date()
  date.setTime(intDate)
  return new Date(date.getFullYear(), date.getMonth(), date.getDay() + 1).getTime()
}

export function startEndDay(timeStamp) {
  return {
    start: new Timestamp(timeStamp.seconds - (timeStamp.seconds % 86400), 0),
    end: new Timestamp(timeStamp.seconds - (timeStamp.seconds % 86400) + 86400, 0)
  }
}

export function nextWeekDate(timeStamp) {
  return new Timestamp(timeStamp.seconds - (timeStamp.seconds % 86400) + 86400 * 7, 0)
}

export function calendarDay(startDate, endDate) {
  let calendar = []
  for (
    let currentDate = startEndDay(startDate).start;
    currentDate.seconds < endDate.seconds - 86400;
    currentDate = startEndDay(currentDate).end
  ) {
    calendar.push(currentDate)
  }
  return calendar
}
export function calendarWeek(startDate, endDate) {
  let calendar = []
  const dayStart = startEndDay(startDate).start
  for (let currentDate = dayStart; currentDate.seconds <= startEndDay(endDate).end.seconds; currentDate = nextWeekDate(currentDate)) {
    calendar.push(currentDate)
  }
  return calendar
}
