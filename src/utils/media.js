export async function requestAndGetUserMedia(
  permissions = {
    video: true
  }
) {
  const result = {
    success: false,
    stream: null,
    error: false
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(permissions)
    result.success = true
    result.stream = stream
  } catch (err) {
    result.error = err
  } finally {
    return result
  }
}
