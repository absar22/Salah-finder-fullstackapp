

const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const PORT = 8000;
const app = express();

app.use(cors());
require('dotenv').config();

let timing;


//  Serve static files from "public"
app.use(express.static(path.join(__dirname, '../public')));


let db
MongoClient.connect(process.env.MONGODB_URI)
.then(data => {
  db = data.db(process.env.MONG0_DB_NAME)
  console.log('Conected To database')
})
.catch(err => console.log(err))

app.get('/get-prayer-times', async (req, res) => {
  const { city, country } = req.query;

  if (!city || !country) {
    return res.send('Please provide both city and country');
  }

  try {
    const apiUrl = `https://api.aladhan.com/timingsByAddress?address=${city},${country}&method=8`;
    const response = await axios.get(apiUrl);
    const timings = response.data.data.timings;

    res.json(timings);
  } catch (error) {
    res.status(500).send('Error fetching prayer times');
  }
   
  // Store Search History
  await db.collection('searches').insertOne({
    city,
    country,
    timing,
    date: new Date()
  })

});



app.get('/search-history', async (req, res) => {
  try {
    const history = await db.collection('searches')
      .find()
      .sort({ date: -1 })
      .limit(10)
      .toArray();
    res.json(history);
  } catch (error) {
    res.status(500).send('Error fetching history');
  }
});





app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
