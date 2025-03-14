require('dotenv').config()

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/about', (req, res) => {
    res.send('about page')
})
app.get('/contact', (req, res) => {
    res.send('contact page')
})

app.get('/login', (req, res) => {
    res.send('<h1>Plese login at bishu.com</h1>')
})
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})