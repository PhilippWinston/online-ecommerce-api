const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    // Find all tags and include their associated Product data
    const tags = await Tag.findAll({
      include: Product,
    });

    res.json(tags);
  } catch (error) {
    console.error('Error retrieving tags:', error);
    res.status(500).json({ error: 'Failed to retrieve tags' });
  }
});

router.get('/:id', async (req, res) => {
  const tagId = req.params.id;

  try {
    // Find a single tag by its `id` and include its associated Product data
    const tag = await Tag.findByPk(tagId, {
      include: Product,
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    console.error(`Error retrieving tag with id ${tagId}:`, error);
    res.status(500).json({ error: 'Failed to retrieve tag' });
  }
});

router.post('/', async (req, res) => {
  const { tag_name } = req.body;

  try {
    // Create a new tag
    const tag = await Tag.create({ tag_name });

    res.status(201).json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

router.put('/:id', async (req, res) => {
  const tagId = req.params.id;
  const { tag_name } = req.body;

  try {
    // Update a tag's name by its `id` value
    const updatedTag = await Tag.update(
      { tag_name },
      { where: { id: tagId } }
    );

    if (updatedTag[0] === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.status(200).json({ message: 'Tag updated successfully' });
  } catch (error) {
    console.error(`Error updating tag with id ${tagId}:`, error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

router.delete('/:id', async (req, res) => {
  const tagId = req.params.id;

  try {
    // Delete one tag by its `id` value
    const deletedTag = await Tag.destroy({ where: { id: tagId } });

    if (!deletedTag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error(`Error deleting tag with id ${tagId}:`, error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

module.exports = router;