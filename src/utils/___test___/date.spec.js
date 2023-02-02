import {Timestamp} from "firebase/firestore";
import {calendarDay, startEndDay} from "src/utils/date";
import { beforeEach, describe, expect, it } from 'vitest'
describe("utils/dates.js",  () =>{
  describe('startEndDay', ()=>{
    it("should return start date and end date"  ,()=>{
      const date = new Timestamp(1675299000)
      const {start, end }= startEndDay(date)
      expect(start.seconds).toBe(1675296000)
      expect(end.seconds).toBe(1675382400)
    })
  })
})
