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

export function startEndDay(timeStamp) {
  return {
    start: new Timestamp(timeStamp.seconds - (timeStamp.seconds % 86400), 0),
    end: new Timestamp(timeStamp.seconds - (timeStamp.seconds % 86400) + 86400, 0)
  }
}

export function nextWeekDate(timeStamp) {
  return new Timestamp(timeStamp.seconds - (timeStamp.seconds % 86400) + 86400 * 7, 0)
}

/**
 * Return A list of dates between the beginning of the startDate
 * and the midnight of the endDate
 *
 * @param startDate
 * @param endDate
 * @returns {Array<Timestamp>}
 */
export function calendarDay(startDate, endDate) {
  let calendar = []
  for (
    let currentDate = startEndDay(startDate).start;
    currentDate.seconds < endDate.seconds + 86400;
    currentDate = startEndDay(currentDate).end
  ) {
    calendar.push(currentDate)
  }
  return calendar
}

/**
 * Return A list of dates between the beginning of the startDate
 * and the midnight of the endDate
 * The period between two dates is one week, except for the last one which may be less.
 *
 * @param startDate
 * @param endDate
 * @returns {*[]}
 */
export function calendarWeek(startDate, endDate) {
  let calendar = []
  const dayStart = startEndDay(startDate).start
  for (let currentDate = dayStart; currentDate.seconds < startEndDay(endDate).end.seconds; currentDate = nextWeekDate(currentDate)) {
    calendar.push(currentDate)
  }
  calendar.push(startEndDay(endDate).end)
  return calendar
}
export const getStats = (reacts, startAt) => {
  let endAt = Timestamp.now()
  if (endAt - startAt > 2678400) {
    endAt = new Timestamp(startAt.seconds + 2678400, 0)
  }

  const _calendarDay = calendarDay(startAt, endAt)
  const _calendarWeek = calendarWeek(startAt, endAt)

  const weekStats = _calendarWeek.map((item, index) => {
    if (index !== _calendarWeek.length - 1) {
      // Get likes Count for the period
      let likesCount = reacts._likes.filter((element) => {
        return element.createdAt >= _calendarWeek[index] && element.createdAt < _calendarWeek[index + 1]
      }).length

      // Get dislikes Count for the period
      let dislikesCount = reacts._dislikes.filter((element) => {
        return element.createdAt >= _calendarWeek[index] && element.createdAt < _calendarWeek[index + 1]
      }).length
      return { date: item, likes: likesCount, dislikes: dislikesCount }
    } else {
      return { date: item, likes: 0, dislikes: 0 }
    }
  })
  const dayStats = _calendarDay.map((item, index) => {
    if (index !== _calendarDay.length - 1) {
      // Get likes Count for the period
      let likesCount = reacts._likes.filter((element) => {
        return element.createdAt >= _calendarDay[index] && element.createdAt < _calendarDay[index + 1]
      }).length

      // Get dislikes Count for the period
      let dislikesCount = reacts._dislikes.filter((element) => {
        return element.createdAt >= _calendarDay[index] && element.createdAt < _calendarDay[index + 1]
      }).length
      return { date: item, likes: likesCount, dislikes: dislikesCount }
    } else {
      return { date: item, likes: 0, dislikes: 0 }
    }
  })

  return { weekStats, dayStats }
}
