import { v2 as cloudinary } from 'cloudinary';

 const cloudinary =  async ()=> {

    // Configuration
    cloudinary.config({ 
        cloud_name: 'dkmrrisek', 
        api_key: '579668224964754', 
        api_secret: 'iaIceTjCo9IZ4dX7xb94Klz37VU' // Click 'View API Keys' above to copy your API secret
    });
    
    // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });
    
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    // console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    // console.log(autoCropUrl);    
}

export default cloudinary;