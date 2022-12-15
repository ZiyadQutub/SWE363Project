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
app.use('/ride', express.static('public'))
app.use('/history', express.static('public'))
app.use(express.urlencoded({extended: true}))
const cookieParser = require('cookie-parser')
app.use(cookieParser())

const rides_model = require('./models/rides_model')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
const { runInNewContext } = require('vm');
dotenv.config()

const authenticateToken = (req, res, next) => {
    // res.clearCookie("access_token")
    const token = req.cookies.access_token;

    console.log(token)
    if (!token) {
        return res.redirect("http://localhost:3000/login")
    }
    try{
        const data = jwt.verify(token, process.env.TOKEN_SECRET)
        req.body.id = data
    }catch(err){

    }
    next()
}

app.get('/', authenticateToken, async (req, res) => {
    const id = req.body.id
    const user = await rides_model.getUserInfo(id)
    console.log(user)
    const name = user.fname + " " + user.lname
    res.render('homePage.html', {name: name})
})

app.post('/', authenticateToken, async (req, res) => {
    let body = req.body

    if (body.from == "0" || body.to == "0" || body.from == body.to) {
        const err = "Invalid from/to values"
        console.log(body)
        const id = req.body.id
        const user = await rides_model.getUserInfo(id)
        const name = user.fname + " " + user.lname
        return res.render("homepage.html", {name:name, error: err})
    }
    let time = 'now'
    if (body.time!=="now") time = body.dateInput + " " + body.timeInput

    rides_model.createRide(body.id, time, body.from, body.to, body.sharedWith)

    res.redirect("/history")

})

app.get('/login', (req, res) => res.render('login.html'))

app.post('/login', async (req, res) => {

    const user = req.body

    const mail = user.userName.trim()

    const status = await rides_model.login(mail, user.password)

    if (status === 'success') {
        const id = await rides_model.getIdFromEmail(mail)
        console.log(id)
        const token = generateAccessToken(id)
        console.log('token generated')
        // document.cookie = `token=${token}`
        res.cookie("access_token", token, {
            httpOnly: true
        })
        .redirect("http://localhost:3000/")
    } else {
        res.render('login.html', {user: user, error: status})
    }
})

app.get('/signup', (req, res) => res.render('signup.html'))

app.post('/signup', async (req, res) => {
    const user = req.body

    // console.log(user)
    const mail = user.email.trim()

    const status = await rides_model.signup(user.firstName, user.lastName, user.password, mail, user.phone, user.birthDate + ' 00:00:00.000')

    if (status==='success') {
        res.redirect('http://localhost:3000/login')
    } else {
        res.render('signup.html', {user: user, error: status})
    }

})

app.get('/logout', (req, res) => {
    res.clearCookie("access_token")
    res.redirect("http://localhost:3000/login")
})

app.get('/driver', authenticateToken, async (req, res) => {
    const id = req.body.id
    const user = await rides_model.getUserInfo(id)
    const name = user.fname + " " + user.lname
    const rides = await rides_model.getRidesForDriver(id)
    console.log(rides)
    res.render('driver.html', {name: name, rides: rides})
})

app.get('/driver', authenticateToken, async (req, res) => {
    const id = req.body.id
    const user = await rides_model.getUserInfo(id)
    const name = user.fname + " " + user.lname
    const rides = await rides_model.getRidesForDriver(id)
    console.log(rides)
    res.render('driver.html', {name: name, rides: rides})
})

app.post('/driver', authenticateToken, async (req, res) => {
    let body = req.body
    console.log(body)
    const id = req.body.id
    const user = await rides_model.getUserInfo(id)
    const name = user.fname + " " + user.lname
    rides_model.makeOffer(body.id, body.rideId, body.price);
    const rides = await rides_model.getRidesForDriver(id)
    res.redirect('http://localhost:3000/myOffers')
})

app.get('/history', authenticateToken, async (req, res) => {
    const id = req.body.id
    const user = await rides_model.getUserInfo(id)
    const name = user.fname + " " + user.lname
    const rides = await rides_model.getRidesHistory(id)
    console.log(rides)
    res.render('history.html', {rides: rides, name: name})
})

app.get('/ride/:id', authenticateToken, async (req, res) => {
    const id = req.body.id
    const user = await rides_model.getUserInfo(id)
    const name = user.fname + " " + user.lname
    const rideId = req.params.id
    const ride = await rides_model.getRide(rideId)
    const offers = await rides_model.getRideOffers(rideId)
    console.log(offers)
    console.log(ride)
    res.render("offersForCustomers.html", {name: name, offers: offers, ride: ride})
})

app.post('/ride/:id', authenticateToken, async (req, res) => {
    const id = req.body.id
    const accept = await rides_model.acceptOffer(req.body.offerId)
    res.redirect('/history')
})

app.get('/myOffers', authenticateToken, async (req, res) => {
    const id = req.body.id;
    const user = await rides_model.getUserInfo(id);
    const name = user.fname + " " + user.lname;
    const offers = await rides_model.getMyOffers(id);
    console.log(offers)
    res.render('OffersFromDriver.html', {name: name, offers: offers})
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

const generateAccessToken = (id) => {
    return jwt.sign(id, process.env.TOKEN_SECRET)
}