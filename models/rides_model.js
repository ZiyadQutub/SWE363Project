const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const getDbConnection = async () => {
    return await sqlite.open({
        filename: 'data_base.db',
        driver: sqlite3.Database
    })
}

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
        // TODO: 'or replace' if something goes wrong
        const adduser = await db.run(`INSERT INTO user(fname, lname, password, email, phone, bdate) VALUES(\'${fname}\', \'${lname}\', \'${password}\', \'${email}\', \'${phone}\', \'${bdate}\');`)
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
        const pass = await db.get(`SELECT password FROM user WHERE email =${email};`)
        db.close()
    return 'success'
    } catch (err) {
        return err.message
    }
}

const makeOffer = async (userId, rideId, price) => {
    try {
        const db = await getDbConnection()
        const offer = await db.run(`INSERT INTO offer(user_id, ride_id, price) VALUES(${userId}, ${rideId}, ${price});`)
        db.close()
    } catch (err) {
        db.close()
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
        db.close()
        return err.message
    }
}

const getUserRides = async (userId) => {
    try {
        const db = await getDbConnection()
        const rides = await db.all(`SELECT * FROM ride WHERE user_id = ${userId}`)
        return rides
    } catch (err) {
        return err.message
    }
}

const getUserInfo = async (userId) => {
    try{
        const db = await getDbConnection()
        const info = await db.get(`SELECT * FROM user WHERE id=${userId}`)
        return info
    } catch (err) {
        return err.message
    }
}

module.exports = {signup, login, getActiveRides, getRideOffers, getUserInfo, getUserRides}