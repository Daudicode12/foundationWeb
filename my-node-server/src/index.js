  // Main entry point for the Node.js server

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT =  process.env.PORT;

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' });
});

// POST /api/signup - simple user registration (development only)
const fs = require('fs');
const bcrypt = require('bcryptjs');
const usersFile = path.join(__dirname, '..', 'data', 'users.json');

app.post('/api/signup', async (req, res) => {
	try {
		const { firstName, lastName, phone, email, password } = req.body;
		if (!firstName || !lastName || !phone || !email || !password) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		// load existing users
		const users = JSON.parse(fs.readFileSync(usersFile, 'utf8') || '[]');

		// check for existing email
		if (users.find(u => u.email === email)) {
			return res.status(409).json({ error: 'Email already registered' });
		}

		const hashed = await bcrypt.hash(password, 10);
		const newUser = { id: Date.now(), firstName, lastName, phone, email, password: hashed };

		users.push(newUser);
		fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

		res.status(201).json({ message: 'User registered', userId: newUser.id });
	} catch (err) {
		console.error('Signup error', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
