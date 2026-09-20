module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { image } = req.body;
  
  if (!image) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    console.error("Missing IMGBB_API_KEY environment variable");
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  try {
    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('image', image); // Base64 data

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: params
    });

    const data = await response.json();
    
    if (data.success) {
      // Use original URL since frontend WebP compression handles the file size perfectly now
      return res.status(200).json({ url: data.data.url });
    } else {
      console.error("ImgBB API Error:", data.error);
      return res.status(500).json({ error: data.error.message || 'ImgBB upload failed' });
    }
  } catch (error) {
    console.error("Serverless Function Error:", error);
    return res.status(500).json({ error: 'Internal server error during upload' });
  }
}
