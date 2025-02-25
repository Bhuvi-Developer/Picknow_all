export const transformImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) {
    return imagePath;
  }

  // Get the filename from the path
  const filename = imagePath.split('\\').pop().split('/').pop();
  
  // Construct the full URL using your backend URL
  return `http://localhost:5000/uploads/${filename}`;
}; 