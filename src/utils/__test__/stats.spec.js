import { describe, expect, it } from 'vitest'
import { groupInfoByWeek, groupInfoByMonth } from 'src/utils/stats'

// Unitest for groupInfoByWeek
// use vitest to run the test
describe('groupInfoByWeek', () => {
  it('groupInfoByWeek: should group data by week', () => {
    const data = [
      { '6/22/2023': { visitors: 1, visits: 1 } },
      { '6/23/2023': { visitors: 0, visits: 0 } },
      { '6/24/2023': { visitors: 0, visits: 0 } },
      { '6/25/2023': { visitors: 1, visits: 2 } },
      { '6/26/2023': { visitors: 0, visits: 0 } },
      { '6/27/2023': { visitors: 0, visits: 0 } },
      { '6/28/2023': { visitors: 0, visits: 2 } },
      { '6/29/2023': { visitors: 0, visits: 1 } },
      { '6/30/2023': { visitors: 0, visits: 1 } }
    ]
    const result = groupInfoByWeek(data)
    expect(result).toEqual([{ '6/22-24': { visitors: 1, visits: 1 } }, { '6/25-30': { visitors: 1, visits: 6 } }])
  })

  // Unitest for groupInfoByMonth
  // use vitest to run the test
  it('groupInfoByMonth : should group data by month', () => {
    const data = [
      { '6/22/2023': { visitors: 1, visits: 1 } },
      { '6/23/2023': { visitors: 0, visits: 0 } },
      { '6/24/2023': { visitors: 0, visits: 0 } },
      { '6/25/2023': { visitors: 1, visits: 2 } },
      { '6/26/2023': { visitors: 0, visits: 0 } },
      { '6/27/2023': { visitors: 0, visits: 0 } },
      { '6/28/2023': { visitors: 0, visits: 2 } },
      { '6/29/2023': { visitors: 0, visits: 1 } },
      { '6/30/2023': { visitors: 0, visits: 1 } }
    ]
    const result = groupInfoByMonth(data)
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "6/2023": {
            "visitors": 2,
            "visits": 7,
          },
        },
      ]
    `)
  })
})
