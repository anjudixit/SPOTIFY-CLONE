import express from 'express';
import cors from 'cors';
const app = express();

// Allow all domains to make requests
app.use(cors());

// OR restrict to specific domains
// app.use(cors({
//   origin: 'https://your-frontend-domain.com'
// }));

app.get('/api', (req, res) => {
  res.send('This is your API!');
});

app.listen(5000, () => {
  console.log('Server running on http://127.0.0.1:5000');
});
