const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require('dotenv');
const path = require('path');
//const Employee = require('./models/Employee');

//const bodyParser = require("body-parser");
//require("dotenv").config();

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
//app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/employees', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Employee Schema & Model
//const mongoose = require('mongoose');
const EmployeeSchema = new mongoose.Schema({
  name: String,
  department: String,
  role: String,
  salary: Number,
  status: String,
});
const Employee = mongoose.model('Employee', EmployeeSchema);


// API Routes

// Get all employees
app.get("/employees", async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

// Add a new employee
app.post("/employees", async (req, res) => {
  const newEmployee = new Employee(req.body);
  await newEmployee.save();
  res.json({ message: "Employee added successfully" });
});

// Update an employee
app.put('/employees/:id', async (req, res) => {
  const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedEmployee);
});

// Delete an employee
app.delete("/employees/:id", async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ message: "Employee deleted successfully" });
});

// Start Server
app.listen(5000, () => console.log('Server running on port 5000'));
