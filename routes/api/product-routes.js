const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    // Find all products and include their associated Category and Tag data
    const products = await Product.findAll({
      include: [
        {
          model: Category,
        },
        {
          model: Tag,
          through: ProductTag,
        },
      ],
    });

    res.json(products);
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// get one product
router.get('/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    // Find a single product by its `id` and include its associated Category and Tag data
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
        },
        {
          model: Tag,
          through: ProductTag,
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(`Error retrieving product with id ${productId}:`, error);
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

// create new product
router.post('/', async (req, res) => {
  const { product_name, price, stock, category_id, tags } = req.body;

  try {
    // Create a new product
    const product = await Product.create({ product_name, price, stock, category_id });

    if (tags && tags.length) {
      // Create pairings to bulk create in the ProductTag model
      const productTagIdArr = tags.map((tag) => {
        return {
          product_id: product.id,
          tag_id: tag.id,
        };
      });

      await ProductTag.bulkCreate(productTagIdArr);
    }

    // Fetch the complete product data, including the associated Category and Tag data
    const completeProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
        },
        {
          model: Tag,
          through: ProductTag,
        },
      ],
    });

    res.status(201).json(completeProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// update product
router.put('/:id', async (req, res) => {
  const productId = req.params.id;
  const { product_name, price, stock, tags } = req.body;

  try {
    // Update product data
    await Product.update(
      { product_name, price, stock },
      { where: { id: productId } }
    );

    if (tags && tags.length) {
      const productTags = await ProductTag.findAll({ where: { product_id: productId } });

      // Create filtered list of new tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = tags
        .filter((tag) => !productTagIds.includes(tag.id))
        .map((tag) => {
          return {
            product_id: productId,
            tag_id: tag.id,
          };
        });

      // Figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !tags.some((tag) => tag.id === tag_id))
        .map(({ id }) => id);

      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error(`Error updating product with id ${productId}:`, error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    // Delete one product by its `id` value
    const deletedProduct = await Product.destroy({ where: { id: productId } });

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(`Error deleting product with id ${productId}:`, error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;