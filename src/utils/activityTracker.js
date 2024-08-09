const INITIAL_WAIT = 3000
const INTERVAL_WAIT = 10000
const ONE_SECOND = 1000

const events = ['mouseup', 'keydown', 'scroll', 'mousemove']

let startTime = Date.now()
const endTime = startTime + INITIAL_WAIT

// Counts for each event
const counts = {
  clicks: 0,
  keypresses: 0,
  mouseMovements: 0,
  scrolls: 0,
  totalTime: 0
}

let intervalId = null

// Event listener functions
const eventHandlers = {
  mouseup: function () {
    counts.clicks++
  },
  keydown: function () {
    counts.keypresses++
  },
  scroll: function () {
    counts.scrolls++
  },
  mousemove: function () {
    counts.mouseMovements++
  }
}

export function startTracking() {
  intervalId = setInterval(function () {
    if (!document.hidden && startTime <= endTime) {
      startTime = Date.now()
      counts.totalTime += ONE_SECOND
    }
  }, ONE_SECOND)

  events.forEach(function (e) {
    document.addEventListener(e, eventHandlers[e])
  })
}

export function stopTracking() {
  clearInterval(intervalId)
  const data = {
    ...counts,
    totalTime: Math.round(counts.totalTime / 1000)
  }

  for (const key in counts) {
    counts[key] = 0
  }

  events.forEach(function (e) {
    document.removeEventListener(e, eventHandlers[e])
  })

  return data
}
