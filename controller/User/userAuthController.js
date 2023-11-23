const { sendMail } = require('../../helpers/sendMail');
const User = require('../../model/User');

const login = async (req, res) => {
  try {
    console.log('login called...');
    // retrive the data from the req.body
    const { email, name } = req.body;

    // validate the data
    if (!email && !name) {
      console.log('Authentication data required:');
      return res.status(400).json({
        hasError: true,
        error: 'Authentication data required',
      });
    }

    // find user by email
    const findUserByEmail = await User.findOne({ email: email });
    console.log('findUserByEmail: ', findUserByEmail);

    if (findUserByEmail) {
      const otp = Math.floor(Math.random() * 90000) + 100000;

      // Update the User
      const updateUser = await User.updateOne(
        { _id: findUserByEmail.id },
        { otp: otp, isVerified: false }
      );

      const resposne = await sendMail({ otp: otp, email: email });
      console.log('resposne: ', resposne);
      if (resposne.hasError === false) {
        // return the response
        return res.status(200).json({
          hasError: false,
          message: 'Otp sent on the email',
          data: {
            id: findUserByEmail.id,
          },
        });
      } else {
        return res.status(400).json({
          hasError: true,
          message: 'Otp not sent on the email',
          data: {
            id: findUserByEmail.id,
          },
        });
      }
    } else {
      // generate the OTP
      const otp = Math.floor(Math.random() * 90000) + 100000;

      // crete user Object
      const userObj = new User({ email: email, name: name, otp: otp });

      // save the data in data base
      const createUser = await userObj.save();

      // return the Err
      if (!createUser) {
        console.log('user not created');
        return res.status(400).json({
          hasError: true,
          error: 'user not created',
        });
      }
      const resposne = await sendMail({ otp: otp, email: email });

      if (resposne.hasError === false) {
        // return the Success response
        return res.status(200).json({
          hasError: false,
          message: 'User Cretaed and OTP sent on mail',
          data: {
            id: createUser.id,
          },
        });
      } else {
        return res.status(400).json({
          hasError: true,
          message: 'Otp not sent on the email',
          data: {
            id: findUserByEmail.id,
          },
        });
      }
    }
  } catch (error) {
    console.log('error: ', error);
    return res.status(400).json({
      error: 'Something went wrong',
    });
  }
};

const otpVerification = async (req, res) => {
  try {
    console.log('otpVerification Called....');

    const { id, otp } = req.body;

    if (!id || !otp) {
      console.log('otpVerification data required....');
      return res.status(400).json({
        error: 'otpVerification data required',
      });
    }

    const findUser = await User.findOne({ _id: id });

    if (parseInt(findUser.otp) === parseInt(otp)) {
      const updateUser = await User.findOneAndUpdate(
        { _id: id },
        { isVerified: true },
        { new: true }
      );

      return res.status(200).json({
        message: 'OTP verified!',
        data: {
          userData: updateUser,
        },
      });
    } else {
      return res.status(400).json({
        error: 'Incorrect OTP!',
      });
    }
  } catch (error) {
    console.log('error: ', error);
    return res.status(500).json({
      error: 'Somthing went wrong!',
    });
  }
};
module.exports = {
  login,
  otpVerification,
};
