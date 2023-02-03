import {Timestamp} from "firebase/firestore";
import {calendarDay, startEndDay} from "src/utils/date";
import { describe, expect, it } from 'vitest'
describe("utils/dates.js",  () =>{
  describe('startEndDay', ()=>{
    it("should return start date and end date"  ,()=>{
      const date = new Timestamp(1675299000)
      const {start, end }= startEndDay(date)
      expect(start.seconds).toBe(1675296000)
      expect(end.seconds).toBe(1675382400)
    })
  })
  describe('calendarDay', ()=>{
    it("should return Calendar of 3 Dates"  ,()=>{
      // StartDate = GMT: Monday 2 January 2023 22:30:37
      const startDate = new Timestamp(1672698637,0)
      // endDate = GMT: Tuesday 3 January 2023 22:30:37
      const endDate = new Timestamp(1672785037,0)

      // calendar should be
      // Monday 2 January 2023 00:00:00 : 1672617600
      // Tuesday 3 January 2023 00:00:00 : 1672704000
      // Wednesday 4 January 2023 00:00:00 : 1672790400000

     const calendar=  calendarDay(startDate,endDate)
      expect(calendar.length).toBe(3)
    })
  })
})
