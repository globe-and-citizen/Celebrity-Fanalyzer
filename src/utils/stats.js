export const formatStats = (stats, interval) => {
  const formattedStats = stats?.map((stat, index) => {
    const date = stat.date.toDate()
    const end = stats[index + 1]?.date.toDate() || date
    const label =
      end - date <= 86400000 ? `${date.getDate()}/${date.getMonth() + 1}` : `${date.getDate()}-${end.getDate()}/${end.getMonth() + 1}`
    return { ...stat, label }
  })

  formattedStats?.pop()
  return formattedStats
}

export const formatAllStats = (stats) => {
  return stats?.map((stat) => ({ ...stat, label: 'All' }))
}

export const transformData = (data) => {
  const allDates = []

  // Extrai todas as datas dos objetos em data1
  data.forEach((item) => {
    item.visits.forEach((date) => {
      if (!allDates.includes(date)) {
        allDates.push(date)
      }
    })
  })

  // Gera as datas ausentes entre a primeira data fornecida e a data de hoje
  const firstDate = new Date(allDates[0])
  const today = new Date()
  let currentDate = new Date(firstDate)

  while (currentDate <= today) {
    const formattedDate = currentDate.toLocaleDateString('en-US')
    if (!allDates.includes(formattedDate)) {
      allDates.push(formattedDate)
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Ordena as datas em ordem crescente
  allDates.sort((a, b) => new Date(a) - new Date(b))

  // console.log(allDates) // ['6/22/2023', '6/23/2023', '6/24/2023', '6/25/2023', '6/26/2023', '6/27/2023', '6/28/2023', '6/29/2023', '6/30/2023']
  // console.log(data) // [{ id: 'r3C28i2x4RUuqn2jrt69A5K6RcC3', visits: ['6/22/2023', '6/25/2023', '6/28/2023', '6/29/2023'] }, { id: 'wVk9Gp2jImQgD4ELfrv43dTbVZQ2', visits: ['6/25/2023', '6/28/2023'] }]

  // Itera sobre o array de allDates e busca pela primeira data de visita em cada item do array data, para popular o objeto de result com a contagem de visitantes.
  const result = []
  allDates.forEach((date) => {
    result.push({ [date]: { visitors: 0, visits: 0 } })
    data.forEach((item) => {
      if (date === item.visits[0]) {
        result[result.length - 1][date].visitors += 1
      }
      if (item.visits.includes(date)) {
        result[result.length - 1][date].visits += 1
      }
    })
  })

  return result
}
