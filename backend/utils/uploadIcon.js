import cloudinary from "cloudinary";
// const cloudinary = require("cloudinary").v2;

export const uploadIconToCloudinary = async (icon) => {
  try {
    const result = await cloudinary.v2.uploader.upload(icon, {
      folder: "icons",
    });
    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    console.error("Error uploading icon to Cloudinary:", error);
    throw error;
  }
};
