const express = require('express')
const app = express()
const port = 3000

const templateEngin = require('nunjucks')
templateEngin.configure('views', {
    express: app
});

app.use(express.static('public'))
app.use('/login', express.static('public'))
app.use('/signup', express.static('public'))

app.get('/', (req, res) => res.render('homePage.html'))

app.get('/login', (req, res) => res.render('login.html'))

app.get('/signup', (req, res) => res.render('signup.html'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))