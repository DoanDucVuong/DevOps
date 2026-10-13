function getMlServiceUrl() {
  let url = (process.env.ML_SERVICE_URL || 'http://localhost:8001').trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'sttn-ml-service') {
      parsed.hostname = 'sttn-ml-service.onrender.com'
      url = parsed.origin
    }
  } catch (e) {
    // fallback
  }
  return url.replace(/\/+$/, '')
}

module.exports = {
  getMlServiceUrl,
}
