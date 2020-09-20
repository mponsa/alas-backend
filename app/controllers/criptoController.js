const { scrap } = require('../services/cryptoPrices.js')
const { scrapRates } = require('../services/defiRates.js')
const async = require('async')
const admin = require('firebase-admin');


async function saveDocument(key, data, collection){
    await admin.firestore().collection(collection).doc(key).set(data)
}


async function getDefiPrices(key){ 
    try{
        const data = await scrap()
        let result;
        
        await async.eachLimit(data, 10, async(record) => {
            const docKey = [record.key,record.timestamp].join('_')
            await saveDocument(docKey, record,'cryptos')

            if(record.key === key){
                result = record
            }
        })

        if(result === undefined){
            return {msg: `Couldn't get price for key provided: ${key}`, code: 404};
        }

        return {data: result, code: 200};
    }catch(error){
        console.log(error.message)
        return {msg: error.message, code: 500};
    } 
}

//Get's rates from defiRates.com
async function getDefiRates(){
    try{
        const data = await scrapRates()

        async.eachLimit(data, 10, async(record) => {
            const key = [record.providerName, record.timestamp].join('_')
            await saveDocument(key, record,'defiRates')
        })

        return {data, code: 200};
    }catch(error){
        console.log(error.message)
        return {msg: error.message, code: 500};
    } 
}

exports.getDefiPrices = getDefiPrices;
exports.getDefiRates = getDefiRates;