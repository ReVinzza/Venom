const express = require('express')
const fetch = require('node-fetch')
const yts = require('yt-search')

const app = express()
const PORT = 3000

app.use(express.static('public'))

app.get('/play', async (req, res) => {
  const text = req.query.q

  if (!text) {
    return res.json({ status: false, msg: 'Masukin judul / link YouTube' })
  }

  try {
    let url = text

    if (!/youtu\.?be/.test(text)) {
      const search = await yts(text)

      if (!search.all.length) {
        return res.json({ status: false, msg: 'Lagu tidak ditemukan' })
      }

      url = search.all[0].url
    }

    const apiUrl = `https://yixe.dongtube.my.id/api/downloader/savetube?url=${encodeURIComponent(url)}&format=mp3`

    const response = await fetch(apiUrl)

    if (!response.ok) {
      return res.json({ status: false, msg: `API Error ${response.status}` })
    }

    const json = await response.json()

    if (!json.success || !json.results) {
      return res.json({ status: false, msg: 'Gagal mendapatkan audio' })
    }

    const { title, download_url, duration, cover } = json.results

    res.json({
      status: true,
      title,
      duration,
      cover,
      download: download_url
    })

  } catch (e) {
    res.json({ status: false, msg: e.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`)
})
