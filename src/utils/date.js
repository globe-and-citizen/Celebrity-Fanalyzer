import { Timestamp } from 'firebase/firestore'

const ONE_DAY_IN_SECONDS = 86400
const ONE_WEEK_IN_SECONDS = 604800

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
    start: new Timestamp(timeStamp.seconds - (timeStamp.seconds % ONE_DAY_IN_SECONDS), 0),
    end: new Timestamp(timeStamp.seconds - (timeStamp.seconds % ONE_DAY_IN_SECONDS) + ONE_DAY_IN_SECONDS, 0)
  }
}

export function nextWeekDate(timeStamp) {
  return new Timestamp(timeStamp.seconds - (timeStamp.seconds % ONE_DAY_IN_SECONDS) + ONE_WEEK_IN_SECONDS, 0)
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
    currentDate.seconds < endDate.seconds + ONE_DAY_IN_SECONDS;
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
  const endAt = Timestamp.now()
  if (endAt - startAt > ONE_DAY_IN_SECONDS * 31) {
    endAt.seconds = startAt.seconds + ONE_DAY_IN_SECONDS * 31
  }

  const getLikesAndDislikesCount = (elements, start, end) => {
    return elements.filter((element) => {
      return element.createdAt >= start && element.createdAt < end
    }).length
  }

  const getStatsForPeriod = (period) => {
    return period.map((item, index) => {
      const likesCount = getLikesAndDislikesCount(reacts._likes, period[index], period[index + 1])
      const dislikesCount = getLikesAndDislikesCount(reacts._dislikes, period[index], period[index + 1])
      return { date: item, likes: likesCount, dislikes: dislikesCount }
    })
  }

  const weekStats = getStatsForPeriod(calendarWeek(startAt, endAt))
  const dayStats = getStatsForPeriod(calendarDay(startAt, endAt))

  return { weekStats, dayStats }
}
