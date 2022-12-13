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
app.use(express.urlencoded({extended: true}))

const rides_model = require('./models/rides_model')

app.get('/', (req, res) => res.render('homePage.html'))

app.get('/login', (req, res) => res.render('login.html'))

app.get('/signup', (req, res) => res.render('signup.njk'))

app.post('/signup', async (req, res) => {
    const user = req.body

    // console.log(user)

    const status = await rides_model.signup(user.firstName, user.lastName, user.password, user.email, user.phone, user.birthDate + ' 00:00:00.000')

    if (status==='success') {
        res.redirect('http://localhost:3000/login')
    } else {
        res.render('signup.njk', {user: user, error: status})
    }

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
