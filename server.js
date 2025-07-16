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
app.get('/', (req, res) => {
  res.send('This server is running on an Android mobile.');
});

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

// EMPLOYEE CRUD
const EMPLOYEE_FILE = path.join(__dirname, 'employees_20000.json');

// Utility to read employees
async function readEmployees() {
  const exists = await fs.pathExists(EMPLOYEE_FILE);
  if (!exists) await fs.writeJSON(EMPLOYEE_FILE, []);
  return await fs.readJSON(EMPLOYEE_FILE);
}

// Utility to write employees
async function writeEmployees(employees) {
  await fs.writeJSON(EMPLOYEE_FILE, employees, { spaces: 2 });
}

// GET all employees

app.get('/employees', async (req, res) => {
  try {
    const employees = await readEmployees();

    // Get query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedEmployees = employees.slice(startIndex, endIndex);

    res.json({
      currentPage: page,
      limit: limit,
      totalEmployees: employees.length,
      totalPages: Math.ceil(employees.length / limit),
      data: paginatedEmployees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// GET employee by ID
app.get('/employees/:id', async (req, res) => {
  const employees = await readEmployees();
  const employee = employees.find(e => e.id === req.params.id);
  if (employee) res.json(employee);
  else res.status(404).json({ message: 'Employee not found' });
});

// POST create employee
app.post('/employees', async (req, res) => {
  const employees = await readEmployees();
  const newEmployee = {
    id: Date.now().toString(),
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    gender: req.body.gender
  };
  employees.push(newEmployee);
  await writeEmployees(employees);
  res.status(201).json(newEmployee);
});

// PUT update employee
app.put('/employees/:id', async (req, res) => {
  const employees = await readEmployees();
  const index = employees.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Employee not found' });

  employees[index] = { ...employees[index], ...req.body };
  await writeEmployees(employees);
  res.json(employees[index]);
});

// DELETE employee
app.delete('/employees/:id', async (req, res) => {
  const employees = await readEmployees();
  const updated = employees.filter(e => e.id !== req.params.id);
  if (updated.length === employees.length) return res.status(404).json({ message: 'Employee not found' });

  await writeEmployees(updated);
  res.json({ message: 'Employee deleted' });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
