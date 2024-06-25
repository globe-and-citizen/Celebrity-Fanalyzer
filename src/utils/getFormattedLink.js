export function getFormattedLink(link) {
  if (link && !/^https?:\/\//i.test(link)) {
    link = 'https://' + link
  }
  return link
}
