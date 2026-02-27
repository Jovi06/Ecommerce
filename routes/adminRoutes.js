const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const isAdmin = require('../middleware/isAdmin');

router.get('/admin/add-product', isAdmin, adminController.getAddProduct);
router.post('/admin/add-product', isAdmin, adminController.upload, adminController.postAddProduct);

module.exports = router;
