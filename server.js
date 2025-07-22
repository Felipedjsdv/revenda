const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('./userRoutes');
require('./db');

app.use(cors());
app.use(express.json());
app.use('/', userRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});