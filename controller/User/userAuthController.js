const User = require('../../model/User');

const login = async (req, res) => {
  try {
    console.log('login called...');
    const { email, name } = req.body;
    if (!email && !name) {
      console.log('Authentication data required:');
      return res.status(400).json({
        hasError: true,
        error: 'Authentication data required',
      });
    }

    const findUserByEmail = await User.findOne({ email: email });
    if (findUserByEmail) {
      console.log('Email in use!');
      return res.status(400).json({
        hasError: true,
        error: 'Email in use!',
      });
    }
    const findUserByName = await User.findOne({ name: name });
    if (findUserByName) {
      console.log('Name in use!');
      return res.status(400).json({
        hasError: true,
        error: 'Name in use!',
      });
    }

    const userObj = new User({ email: email, name: name });
    const createUser = await userObj.save();

    if (!createUser) {
      console.log('user not created');
      return res.status(400).json({
        hasError: true,
        error: 'user not created',
      });
    }
    console.log('User Cretaed');
    return res.status(200).json({
      hasError: false,
      message: 'User Cretaed',
      data: createUser,
      error: '',
    });
  } catch (error) {
    console.log('error: ', error);
    return res.status(400).json({
      error: 'Something went wrong',
    });
  }
};

module.exports = {
  login,
};
