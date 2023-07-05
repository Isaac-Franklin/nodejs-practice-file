const fs = require('fs');
// const TourModel = require('./controller/tourController')
const TourModel = require(`${__dirname}/module/tourModule`)
const allFilesData = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, 'utf-8'))



const addData = async () => {
    try{
        await TourModel.create(allFilesData)
        console.log('DATA CREATED SUCCESSFULLY')
    } catch (err){
        console.log(err.message)
    }
}

if (process.argv[2] === '--anyname'){
    addData()
    // console.log(allFilesData)
    // process.exit();
}else{
    console.log('SOMETHING WENT WRONG!!!')
}


// console.log(process.argv)