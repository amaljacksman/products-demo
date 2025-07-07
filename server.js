const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3100;
const DATA_FILE = path.join(__dirname, 'products.json');

app.use(cors({ origin: '*' }));
app.use(express.json());

// Utility to read products
async function readProducts() {
  const exists = await fs.pathExists(DATA_FILE);
  if (!exists) await fs.writeJSON(DATA_FILE, []);
  return await fs.readJSON(DATA_FILE);
}

// Utility to write products
async function writeProducts(products) {
  await fs.writeJSON(DATA_FILE, products, { spaces: 2 });
}

// GET all products
app.get('/products', async (req, res) => {
  const products = await readProducts();
  res.json(products);
});

// GET a single product by ID
app.get('/products/:id', async (req, res) => {
  const products = await readProducts();
  const product = products.find(p => p.id === req.params.id);
  if (product) res.json(product);
  else res.status(404).json({ message: 'Product not found' });
});

// POST a new product
app.post('/products', async (req, res) => {
  const products = await readProducts();
  const newProduct = {
    id: Date.now().toString(), // Simple ID
    ...req.body
  };
  products.push(newProduct);
  await writeProducts(products);
  res.status(201).json(newProduct);
});

// PUT update a product
app.put('/products/:id', async (req, res) => {
  let products = await readProducts();
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  products[index] = { ...products[index], ...req.body };
  await writeProducts(products);
  res.json(products[index]);
});

// DELETE a product
app.delete('/products/:id', async (req, res) => {
  let products = await readProducts();
  const updatedProducts = products.filter(p => p.id !== req.params.id);
  if (updatedProducts.length === products.length) {
    return res.status(404).json({ message: 'Product not found' });
  }
  await writeProducts(updatedProducts);
  res.json({ message: 'Product deleted' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
