require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const quoteRoutes = require('./routes/quoteRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { hasEmailConfig } = require('./utils/email');

const app = express();

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/quote', quoteRoutes);
app.use('/api/contact', contactRoutes);

const sendPage = (res, fileName) => {
  res.sendFile(path.join(__dirname, '..', 'public', fileName));
};

app.get('/', (req, res) => sendPage(res, 'index.html'));
app.get('/about', (req, res) => sendPage(res, 'about.html'));
app.get('/services', (req, res) => sendPage(res, 'services.html'));
app.get('/quote', (req, res) => sendPage(res, 'quote.html'));
app.get('/contact', (req, res) => sendPage(res, 'contact.html'));
app.get('/politica-de-confidentialitate', (req, res) => sendPage(res, 'politica-de-confidentialitate.html'));
app.get('/termeni-si-conditii', (req, res) => sendPage(res, 'termeni-si-conditii.html'));
app.get('/politica-cookies', (req, res) => sendPage(res, 'politica-cookies.html'));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'Eroare interna.' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  const emailStatus = hasEmailConfig() ? 'configurat' : 'neconfigurat';
  console.log(`Server pornit pe portul ${port}. Email: ${emailStatus}.`);
});

