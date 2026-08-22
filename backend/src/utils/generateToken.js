const jwt = require('jsonwebtoken')

// Generate a JWT token for a student
//
// WHY we use JWT:
// HTTP is stateless — the server doesn't remember who you are between requests.
// JWT solves this by giving the client a signed token that contains the student's
// identity. The client sends this token with every request, and the server can
// verify it without checking the database each time.
//
// WHY we store id and role in the payload:
// - id: so we know WHICH student is making the request
// - role: so we can check WHAT they're allowed to do (e.g., student vs admin)

function generateToken(student) {
    const payload = {
        id: student._id,
        role: student.role
    }

    // jwt.sign() creates the token
    // Arguments:
    //   1. payload — the data to encode inside the token
    //   2. secret  — a private key used to sign the token (only the server knows this)
    //   3. options — expiresIn sets when the token becomes invalid
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })

    return token
}

module.exports = { generateToken }
