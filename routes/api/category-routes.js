  const router = require('express').Router();
  const { Category, Product } = require('../../models');

  // The `/api/categories` endpoint

  router.get('/', async (req, res) => {
    try {
      // Find all categories and include their associated Products
      const categories = await Category.findAll({
        include: Product,
      });
      
      res.json(categories);
    } catch (error) {
      console.error('Error retrieving categories:', error);
      res.status(500).json({ error: 'Failed to retrieve categories' });
    }
  });

  router.get('/:id', async (req, res) => {
    const categoryId = req.params.id;

    try {
      // Find one category by its `id` value and include its associated Products
      const category = await Category.findByPk(categoryId, {
        include: Product,
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(category);
    } catch (error) {
      console.error(`Error retrieving category with id ${categoryId}:`, error);
      res.status(500).json({ error: 'Failed to retrieve category' });
    }
  });

  router.post('/', async (req, res) => {
    const { category_name } = req.body;

    try {
      // Create a new category
      const category = await Category.create({ category_name });

      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  });

  router.put('/:id', async (req, res) => {
    const categoryId = req.params.id;
    const { category_name } = req.body;

    try {
      // Update a category by its `id` value
      const updatedCategory = await Category.update(
        { category_name },
        { where: { id: categoryId } }
      );

      if (updatedCategory[0] === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
      console.error(`Error updating category with id ${categoryId}:`, error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  });

  router.delete('/:id', async (req, res) => {
    const categoryId = req.params.id;

    try {
      // Delete a category by its `id` value
      const deletedCategory = await Category.destroy({ where: { id: categoryId } });

      if (!deletedCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error(`Error deleting category with id ${categoryId}:`, error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  module.exports = router;;
