const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')

const getDbConnection = async () => {
    return await sqlite.open({
        filename: 'data_base.db',
        driver: sqlite3.Database
    })
}

dotenv.config()

const getActiveRides = async () => {
    try {
        const db = await getDbConnection()
        const rides = await db.all('SELECT * FROM ride WHERE status = "active";')
        db.close()
        return rides
    } catch (err) {
        db.close()
        return err.message
    }
}

const signup = async (fname, lname, password, email, phone, bdate) => {
    try {
        const db = await getDbConnection()
        saltRound = process.env.SALT_ROUND
        
        const salt = bcrypt.genSaltSync(1*saltRound)
        const hash = bcrypt.hashSync(password, salt)
        console.log(salt, hash)
        const adduser = await db.run(`INSERT INTO user(fname, lname, password, email, phone, bdate, salt) VALUES(\'${fname}\', \'${lname}\', \'${hash}\', \'${email}\', \'${phone}\', \'${bdate}\', \'${salt}\');`)
        // console.log(pass)
        db.close()
    } catch (err) {
        console.log(err.message)
        return err.message
    }
    return 'success'
}

const login = async (email, password) => {
    try {
        const db = await getDbConnection()
        const pass = await db.get(`SELECT password FROM user WHERE email =\'${email}\';`)
        db.close()

        const result = bcrypt.compareSync(password, pass.password)

        if (result)
            return 'success'
        else
            return "email or password are not correct"
    } catch (err) {
        return err.message
    }
}

const makeOffer = async (userId, rideId, price) => {
    try {
        const db = await getDbConnection()
        const offer = await db.run(`INSERT INTO offer(user_id, ride_id, price, status) VALUES(${userId}, ${rideId}, ${price}, 'new');`)
        db.close()
    } catch (err) {
        return err.message
    }
}

const getRideOffers = async (rideId) => {
    try {
        const db = await getDbConnection()
        const offers = await db.all(`SELECT * FROM offer WHERE ride_id = ${rideId}`)
        db.close()
        return offers
    } catch (err) {
        return err.message
    }
}

const getRidesHistory = async (userId) => {
    try {
        const db = await getDbConnection()
        const rides = await db.all(`SELECT * FROM ride WHERE user_id = ${userId}`)
        db.close()
        return rides
    } catch (err) {
        return err.message
    }
}

const getRidesForDriver = async (userId) => {
    try {
        const db = await getDbConnection()
        const rides = await db.all(`SELECT * FROM ride WHERE user_id <> ${userId} AND status='active'`)
        db.close()
        return rides
    } catch (err) {
        return err.message
    }
}

const getUserInfo = async (userId) => {
    try{
        const db = await getDbConnection()
        const info = await db.get(`SELECT * FROM user WHERE id=${userId}`)
        db.close()
        return info
    } catch (err) {
        return err.message
    }
}

const getIdFromEmail = async (email) => {
    try {
        const db = await getDbConnection()
        const id = await db.get(`SELECT id FROM user WHERE email=\'${email}\'`)
        db.close()
        return id.id
    } catch(err) {
        return err.message
    }
}

const createRide = async(userId, time, departure, destination, sharedWith) => {
    try {
        const db = await getDbConnection()
        const addRide = await db.run(`INSERT INTO ride(user_id, time, status, departure, destination, shared_with) VALUES(${userId}, \'${time}\', 'active', \'${departure}\', \'${destination}\', \'${sharedWith}\')`)
        db.close()
    } catch (err) {
        return err.message
    }
}

const getRide = async (rideId) => {
    try{
        const db = await getDbConnection()
        const rides = await db.get(`SELECT * FROM ride WHERE id = ${rideId}`)
        db.close()
        return rides
    } catch (err) {
        return err.message
    }
}

const getMyOffers = async (userId) => {
    try {
        const db = await getDbConnection()
        const offers = await db.all(`SELECT o.price, o.status, r.destination, r.departure, r.time FROM offer o, ride r WHERE o.ride_id = r.id AND o.user_id= ${userId}`)
        console.log(offers)
        // offers.forEach( async (offer) => {
        //     let tmpRide = await db.get(`SELECT * FROM ride WHERE id = ${offer.ride_id}`)
        //     tmpRide['price'] = offer.price
        //     tmpRide['status'] = offer.status
        //     ride.push(tmpRide)
        // })
        db.close()
        return offers
    } catch (err) {
        return err.message
    }
}

const acceptOffer = async (offerId) => {
    try {
        const db = await getDbConnection()
        const offer = await db.get(`SELECT * FROM offer WHERE id = ${offerId}`)
        const notAccept = await db.run(`UPDATE offer SET status='not accepted' WHERE ride_id=${offer.ride_id}`)
        const accept = await db.run(`UPDATE offer SET status='accepted' Where id=${offerId}`)
        const acceptRide = await db.run(`UPDATE ride SET status='accepted' Where id=${offer.ride_id}`)
    } catch (err) {
        return err.message
    }
}

module.exports = {signup, login, getActiveRides, getRideOffers, getUserInfo, getRidesHistory, getIdFromEmail, makeOffer, createRide, getRidesForDriver, getRide, getMyOffers, acceptOffer}