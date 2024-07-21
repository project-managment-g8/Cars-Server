// server/userController/userController.js
const users = [
  {
    name: 'John',
    id: 1,
    email: 'test@example.com',
    password: 'Password1!' // Ensure the password meets validation criteria
  }
];
  
// @desc login user 
// @route POST /api/users/login
// @access public
  
const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email,password);
  // Find the user by email
  const user = users.find((user) => user.email === email);
  
  // Validate user credentials
  if (user && user.password === password) {
    res.json({
      success: true,
      userName: user.name
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
};
  
export { login };
  