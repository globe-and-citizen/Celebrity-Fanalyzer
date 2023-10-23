const INITIAL_WAIT = 3000
const INTERVAL_WAIT = 10000
const ONE_SECOND = 1000

// List of events to track
const events = ['mouseup', 'keydown', 'scroll', 'mousemove']

// Start time is set to current time and end time is set to current time plus
let startTime = Date.now()
let endTime = startTime + INITIAL_WAIT

// Counts for each event
const counts = {
  clicks: 0,
  keypresses: 0,
  mouseMovements: 0,
  scrolls: 0,
  totalTime: 0
}

// Interval id for tracking time intervals
let intervalId = null

// Starts tracking user events and updates counts and time intervals
export function startTracking() {
  intervalId = setInterval(function () {
    if (!document.hidden && startTime <= endTime) {
      startTime = Date.now()
      counts.totalTime += ONE_SECOND
    }
  }, ONE_SECOND)

  events.forEach(function (e) {
    document.addEventListener(e, function () {
      endTime = Date.now() + INTERVAL_WAIT
      if (e === 'mouseup') {
        counts.clicks++
      } else if (e === 'keydown') {
        counts.keypresses++
      } else if (e === 'scroll') {
        counts.scrolls++
      } else if (e === 'mousemove') {
        counts.mouseMovements++
      }
    })
  })
}

// Stops tracking user events and returns counts and time intervals
export function stopTracking() {
  clearInterval(intervalId)
  const data = {
    ...counts,
    totalTime: Math.round(counts.totalTime / 1000)
  }

  for (const key in counts) {
    counts[key] = 0
  }

  return data
}
