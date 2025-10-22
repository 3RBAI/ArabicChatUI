import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // For now, just serve the static React app
  // API functionality will be added once we resolve the TypeScript compilation
  
  try {
    // Try to serve the React app
    const indexPath = path.join(__dirname, '..', 'dist', 'public', 'index.html');
    
    if (fs.existsSync(indexPath)) {
      const html = await fs.promises.readFile(indexPath, 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else {
      // If index.html doesn't exist, return a simple message
      res.status(200).json({ 
        message: 'ArabicChatUI API is running',
        path: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}