import userModel from "../model/user.model.js";

// Get user by id
export const getUserById = async (id, res) => {
  const userJson = await userModel.findById(id);

  if (userJson) {
    const user = userJson;
    res.status(201).json({
      success: true,
      user,
    });
  }
};

// Gel all users
export const getAllUsersService = async (res) => {
  const users = await userModel.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    users,
  });
};

// Update user role
export const updateUserRoleService = async (res, id, role) => {
  const user = await userModel.findByIdAndUpdate(id, { role }, { new: true });

  res.status(200).json({
    success: true,
    user,
  });
};
