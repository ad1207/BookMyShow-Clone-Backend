const {MongoClient} = require("mongodb")

module.exports = {
    selectedDb : {},
    async connect(){
        try{
            const client = await MongoClient.connect(process.env.MONGO_DB_URL)
            this.selectedDb = client.db('bookMyShow')
            console.log(this.selectedDb)
        }catch(err){
            console.log(err)
        }
    }
}