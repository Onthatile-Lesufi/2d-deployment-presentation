const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, profilePic } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash the password before saving (do NOT store raw password!)
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    profilePic // save the image path here
  });

  if (user) {
    console.log("User created:", user);
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});
