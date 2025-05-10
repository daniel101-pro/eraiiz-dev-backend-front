exports.verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
  
    if (user.verificationToken !== otp || Date.now() > user.tokenExpiry)
      return res.status(400).json({ message: 'Invalid or expired code' });
  
    user.isVerified = true;
    user.verificationToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();
  
    return res.status(200).json({ message: 'Email verified successfully' });
  };
  