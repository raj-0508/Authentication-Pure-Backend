import {v2 as cloudinary} from "cloudinary"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!, 
  api_key: process.env.CLOUDINARY_API_KEY!, 
  api_secret: process.env.CLOUDINARY_API_SECRET! 
});

const uploadOnCloudinary = async (fileBuffer: Buffer | string): Promise<any> => {
    try {
        if (!fileBuffer) return null
        
        // Upload the file buffer directly to Cloudinary
        const response = await cloudinary.uploader.upload(
            typeof fileBuffer === 'string' ? fileBuffer : `data:image/jpeg;base64,${fileBuffer.toString('base64')}`, 
            {
                resource_type: "auto"
            }
        )
        
        return response;

    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return null;
    }
}



export {uploadOnCloudinary}
