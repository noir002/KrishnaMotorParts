const express = require('express');
const {
  getProducts,
  getProduct,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCompatibility,
  getBrands,
  getVehicleMakes,
  getVehicleModels,
  getVehicleYears
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { validateProduct, validateProductUpdate } = require('../middleware/validation');
const { cacheProductList, cacheProduct } = require('../middleware/cache');

const router = express.Router();

// Public routes with caching
router.get('/', cacheProductList, getProducts);
router.get('/brands', getBrands);
router.get('/compatibility/makes', getVehicleMakes);
router.get('/compatibility/makes/:make/models', getVehicleModels);
router.get('/compatibility/makes/:make/models/:model/years', getVehicleYears);
router.get('/compatibility/:make/:model/:year', cacheProductList, getProductsByCompatibility);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', cacheProduct, getProduct);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), validateProduct, createProduct);
router.put('/:id', protect, authorize('admin'), validateProductUpdate, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;