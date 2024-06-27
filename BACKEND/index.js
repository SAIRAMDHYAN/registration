require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const EmployeeModel = require('./models/employee');
const isLoggedIn =require('./middlwear/isLoggedIn')

const app = express();
const port = process.env.PORT || 3003;

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

// Registration endpoint
app.post('/register', upload.single('image'), async (req, res) => {
    const { name, email, password } = req.body;
    const imagePath = req.file ? req.file.path : '';

    try {
        const existingEmployee = await EmployeeModel.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashed_password = await bcrypt.hash(password, 10);
        const employee = await EmployeeModel.create({ 
            name, 
            email, 
            password: hashed_password, 
            image: imagePath 
        });
        res.status(201).json(employee);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to register user", details: err });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const employee = await EmployeeModel.findOne({ email });
        if (!employee) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ email: employee.email }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.json({
            message: 'Login successful',
            image: employee.image,
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Secure route example
app.get('/home', isLoggedIn, (req, res) => {
    res.json({ message: "Welcome to the Home Page!" });
});

app.get('/about', (req, res) => {
    res.json({ message: "Welcome to the About Page!" });
});

app.get('*', (req, res) => {
    res.redirect('/register');
});

app.listen(port, () => {
    console.log('Server is running on port', port);
});
