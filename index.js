require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); // Middleware para analizar los datos del cuerpo

// Datos en memoria para almacenar las URLs
let urlDatabase = [];
let idCounter = 1;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// POST endpoint para acortar la URL
app.post('/api/shorturl', function (req, res) {
  const { url } = req.body;

  try {
    // Validar si la URL comienza con "http://", "https://"
    const urlRegex = /^(http|https):\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/;
    if (!urlRegex.test(url)) {
      return res.json({ error: 'invalid url' });
    }

    // Extraer solo el hostname para la validación con dns.lookup
    const hostname = new URL(url).hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Almacenar la URL en la "base de datos"
      const shortUrl = idCounter++;
      urlDatabase.push({ original_url: url, short_url: shortUrl });

      // Responder con la URL original y la acortada
      res.json({ original_url: url, short_url: shortUrl });
    });
  } catch (e) {
    res.json({ error: 'invalid url' });
  }
});

// GET endpoint para redirigir a la URL original
app.get('/api/shorturl/:short_url', function (req, res) {
  const { short_url } = req.params;

  const foundUrl = urlDatabase.find((entry) => entry.short_url == short_url);
  if (foundUrl) {
    return res.redirect(foundUrl.original_url);
  } else {
    return res.json({ error: 'No short URL found' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
