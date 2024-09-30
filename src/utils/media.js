/**
 *
 * @param {Object} permissions
 * @returns {Promise<{ success: boolean, error: boolean | Object | string, stream: MediaStream }>}
 */
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
