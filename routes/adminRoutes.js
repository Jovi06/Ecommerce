const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const isAdmin = require('../middleware/isAdmin');

// Dashboard
router.get('/admin/dashboard', isAdmin, adminController.getDashboard);

// Add Product
router.get('/admin/add-product', isAdmin, adminController.getAddProduct);
router.post('/admin/add-product', isAdmin, adminController.upload, adminController.postAddProduct);

// Manage Products
router.get('/admin/products', isAdmin, adminController.getManageProducts);
router.post('/admin/products/delete', isAdmin, adminController.postDeleteProduct);
router.get('/admin/products/edit/:id', isAdmin, adminController.getEditProduct);
router.post('/admin/products/edit/:id', isAdmin, adminController.upload, adminController.postEditProduct);

// Manage Orders
router.get('/admin/orders', isAdmin, adminController.getManageOrders);
router.post('/admin/orders/update-status', isAdmin, adminController.postUpdateOrderStatus);

// Manage Users
router.get('/admin/users', isAdmin, adminController.getManageUsers);
router.post('/admin/users/update-role', isAdmin, adminController.postUpdateUserRole);

// Manage Coupons
router.get('/admin/coupons', isAdmin, adminController.getManageCoupons);
router.post('/admin/coupons', isAdmin, adminController.postAddCoupon);
router.post('/admin/coupons/delete', isAdmin, adminController.postDeleteCoupon);

module.exports = router;
