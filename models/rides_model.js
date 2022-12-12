const sqlite = require('sqlite')
const sqlite3 = require('sqlite3')

const getDbConnection = async () => {
    return await sqlite.open({
        filename: 'recipes_store.db3',
        driver: sqlite3.Database
    })
}