import express from 'express'
const router = express.Router()
import viewController from '../controller/viewController.js'

// router.get('/', viewController.BasePage)

router.get('/', viewController.OverviewPage)
router.get('/tourdata/:tourSlug', viewController.TourDetails)
router.get('/login', viewController.LoginPage)

export default router
