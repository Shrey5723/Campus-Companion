const express = require('express')
const authController = require('../controllers/auth.controller')
const { validateRegister, validateLogin } = require('../validators/auth.validator')

const authRouter = express.Router()

// POST /api/auth/register — Register (activate) a student account
// The request goes through: validateRegister → authController.register
// If validation fails, the controller never runs.
authRouter.post('/register', validateRegister, authController.register)

// POST /api/auth/login — Login a student
// The request goes through: validateLogin → authController.login
authRouter.post('/login', validateLogin, authController.login)

module.exports = authRouter
