import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET  // Click 'View API Keys' above to copy your API secret
    });
    
    // Upload an image
    const uploadOnCloudinary = async (localPath) =>{
    try {
        if (!localPath) return null;
        const response = await cloudinary.uploader.upload(localPath, {
            resource_type: "auto"
        });

        return response;
    } catch (error) {

        fs.unlinkSync(localPath);//remove the file from the temp folder as the upload operation got failed
        return null;
        console.log(error);
    }
    }

    export { uploadOnCloudinary};