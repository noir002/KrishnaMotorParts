const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CATEGORIES_ERROR',
        message: 'Failed to fetch categories'
      }
    });
  }
});

// Get category tree
router.get('/tree', async (req, res) => {
  try {
    const categoryTree = await Category.getCategoryTree();

    res.status(200).json({
      success: true,
      data: categoryTree
    });
  } catch (error) {
    console.error('Error fetching category tree:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CATEGORY_TREE_ERROR',
        message: 'Failed to fetch category tree'
      }
    });
  }
});

// Get category by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findBySlug(slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CATEGORY_ERROR',
        message: 'Failed to fetch category'
      }
    });
  }
});

// Search categories
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SEARCH_QUERY',
          message: 'Search query is required'
        }
      });
    }

    const categories = await Category.searchCategories(q.trim());

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error searching categories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_CATEGORIES_ERROR',
        message: 'Failed to search categories'
      }
    });
  }
});

module.exports = router;