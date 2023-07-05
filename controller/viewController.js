import Tour from '../module/tourModule.js';

const BasePage = ((req, res) => {
    res.status(200).render('base')
})

const OverviewPage = async(req, res) => {
    const tours = await Tour.find()
    res.status(200).render('overview', {
        tours
    })
}

const TourDetails = async(req, res) => {
    const tourSlug = req.params.tourSlug
    const mainTour = await Tour.findOne({name : tourSlug})
    if (mainTour){
        res.status(200).render('tour', {
            mainTour
        })
    }
    else{
        res.status(404).json({message: 'an error occurred'})
    }
};


const LoginPage = (req, res) => {
    res.status(200).render('login')
}


export default {
    BasePage, LoginPage, TourDetails, OverviewPage, 
}