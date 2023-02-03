import { Timestamp } from 'firebase/firestore'
import { calendarDay, calendarWeek, getStats, startEndDay } from 'src/utils/date'
import { describe, expect, it } from 'vitest'

describe('utils/dates.js', () => {
  describe('startEndDay', () => {
    it('should return start date and end date', () => {
      const date = new Timestamp(1675299000)
      const { start, end } = startEndDay(date)
      expect(start.seconds).toBe(1675296000)
      expect(end.seconds).toBe(1675382400)
    })
  })
  describe('calendarDay', () => {
    it('should return Calendar of 3 Dates', () => {
      // StartDate = GMT: Monday 2 January 2023 22:30:37
      const startDate = new Timestamp(1672698637, 0)
      // endDate = GMT: Tuesday 3 January 2023 22:30:37
      const endDate = new Timestamp(1672785037, 0)

      // calendar should be
      // Monday 2 January 2023 00:00:00 : 1672617600
      // Tuesday 3 January 2023 00:00:00 : 1672704000
      // Wednesday 4 January 2023 00:00:00 : 1672790400000

      const calendar = calendarDay(startDate, endDate)
      expect(calendar.length).toBe(3)
    })
  })

  describe('calendarWeek', () => {
    it('should return Calendar of 3 Weeks', () => {
      // StartDate = GMT: Saturday 3 December 2022 10:52:03
      const startDate = new Timestamp(1670064723, 0)
      // endDate = GMT: Tuesday 3 January 2023 22:30:37
      const endDate = new Timestamp(1672785037, 0)

      // calendar should be
      // Saturday 3 December 2022 00:00:00 : 1670025600
      // Saturday 10 December 2022 00:00:00 : 1670630400
      // Saturday 17 December 2022 00:00:00 : 1671235200
      // Saturday 24 December 2022 00:00:00 : 1671840000
      // Saturday 31 December 2022 00:00:00 : 1672444800
      // Wednesday 4 January 2022 00:00:00 : 1672790400

      const calendar = calendarWeek(startDate, endDate)
      expect(calendar.length).toBe(6)
    })
  })

  describe('getStats', () => {
    it('should return stats', () => {
      const reacts = {
        _likes: [{ createdAt: new Timestamp(1674975848, 678000000) }, { createdAt: new Timestamp(1675277162, 886000000) }],
        _dislikes: [{ createdAt: new Timestamp(1675344527, 684000000) }]
      }

      //  Sunday 29 January 2023 07:02:56
      const startAt = new Timestamp(1674975776, 0)
      const stats = getStats(reacts, startAt)

      expect(stats.weekStats.length).toBe(2)
      expect(stats.dayStats.length).toBe(7)

      const wekResult = [
        { likes: 2, dislikes: 1 },
        { likes: 0, dislikes: 0 }
      ]
      const dateResult = [
        { likes: 1, dislikes: 0 },
        { likes: 0, dislikes: 0 },
        { likes: 0, dislikes: 0 },
        { likes: 1, dislikes: 0 },
        { likes: 0, dislikes: 1 },
        { likes: 0, dislikes: 0 },
        { likes: 0, dislikes: 0 }
      ]

      stats.dayStats.map((dayStat, index) => {
        expect(dayStat.likes).toBe(dateResult[index].likes)
        expect(dayStat.dislikes).toBe(dateResult[index].dislikes)
      })

      stats.weekStats.map((weekStat, index) => {
        expect(weekStat.likes).toBe(wekResult[index].likes)
        expect(weekStat.dislikes).toBe(wekResult[index].dislikes)
      })
    })
  })
})
