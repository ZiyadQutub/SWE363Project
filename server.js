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
const cookieParser = require('cookie-parser')
app.use(cookieParser())

const rides_model = require('./models/rides_model')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const authenticateToken = (req, res, next) => {
    const token = req.cookies.access_token;

    console.log(token)
    if (!token) {
        return res.redirect("http://localhost:3000/login")
    }
    try{
        const data = jwt.verify(token, process.env.TOKEN_SECRET)
        console.log(data)
    }catch(err){

    }
    next()
}

app.get('/', authenticateToken, (req, res) => {
    // console.log(req.body.email)

    // cookie = document.cookie

    // if (typeof cookie == undefined) {
        // res.redirect('localhost:3000/login')
    // } else {
        res.render('homePage.html')
    // }

})

app.get('/login', (req, res) => res.render('login.njk'))

app.post('/login', async (req, res) => {

    const user = req.body

    const mail = user.userName.trim()

    const status = await rides_model.login(mail, user.password)

    if (status === 'success') {
        console.log(mail)
        const token = generateAccessToken(mail)
        console.log('token generated')
        // document.cookie = `token=${token}`
        res.cookie("access_token", token, {
            httpOnly: true
        })
        .redirect("http://localhost:3000/")
    } else {
        res.render('login.njk', {user: user, error: status})
    }
})

app.get('/signup', (req, res) => res.render('signup.njk'))

app.post('/signup', async (req, res) => {
    const user = req.body

    // console.log(user)
    const mail = user.email.trim()

    const status = await rides_model.signup(user.firstName, user.lastName, user.password, mail, user.phone, user.birthDate + ' 00:00:00.000')

    if (status==='success') {
        res.redirect('http://localhost:3000/login')
    } else {
        res.render('signup.njk', {user: user, error: status})
    }

})

app.get('/logout', (req, res) => {
    res.clearCookie("access_token")
    res.redirect("http://localhost:3000/login")
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

const generateAccessToken = (email) => {
    return jwt.sign(email, process.env.TOKEN_SECRET)
}

