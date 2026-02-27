const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.get('/', shopController.getHome);
router.get('/men', shopController.getMen);
router.get('/women', shopController.getWomen);
router.get('/kids', shopController.getKids);
router.get('/product/:id', shopController.getProduct);

module.exports = router;
