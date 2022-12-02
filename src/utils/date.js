function shortMonthDay(timestamp = undefined) {
  let date

  if (timestamp) {
    date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
  } else {
    date = new Date()
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) // Nov 2
}

export { shortMonthDay }
