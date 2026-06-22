const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// --- DATABASE LINK ---
const MONGO_URI = 'mongodb+srv://hospitalAdmin:warishaazeem20@cluster0.kladvsb.mongodb.net/lab12_crud_db?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI)
  .then(() => console.log('DATABASE STATUS: Connected to lab12_crud_db Cluster.'))
  .catch(err => console.error('DATABASE EXCEPTION: Conn Fault ->', err));

// --- SCHEMA WITH VALIDATORS & ENUM STATES ---
const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: [0, 'Quantity cannot be negative'] },
  status: { type: String, enum: ['NOMINAL', 'CRITICAL', 'DEPLETED'], default: 'NOMINAL' },
  lastUpdated: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

// 1. CREATE
app.post('/api/products', async (req, res) => {
  try {
    const { name, qty } = req.body;
    let itemStatus = 'NOMINAL';
    if (qty == 0) itemStatus = 'DEPLETED';
    else if (qty <= 5) itemStatus = 'CRITICAL';

    const newProduct = new Product({ productName: name, quantity: qty, status: itemStatus });
    const savedProduct = await newProduct.save();
    res.status(201).json({ success: true, data: savedProduct });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 2. READ
app.get('/api/products', async (req, res) => {
  try {
    const inventory = await Product.find();
    res.json({ success: true, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. UPDATE
app.put('/api/products/:id', async (req, res) => {
  try {
    const { qty } = req.body;
    let itemStatus = 'NOMINAL';
    if (qty == 0) itemStatus = 'DEPLETED';
    else if (qty <= 5) itemStatus = 'CRITICAL';

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { quantity: qty, status: itemStatus, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ success: false, error: "Item not found" });
    res.json({ success: true, data: updatedProduct });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. DELETE
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ success: false, error: "Item not found" });
    res.json({ success: true, message: "Document successfully cleared from storage disk." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`SERVER OPERATIONAL: Access via http://localhost:${PORT}`);
});