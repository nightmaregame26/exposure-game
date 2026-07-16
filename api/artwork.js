import fs from 'node:fs';
import path from 'node:path';

const ALLOWED = new Set(['home', 'map']);

export default function handler(req, res) {
  const screen = String(req.query?.screen || 'home').toLowerCase();

  if (!ALLOWED.has(screen)) {
    res.status(400).json({ error: 'Unsupported artwork screen.' });
    return;
  }

  try {
    const directory = path.join(process.cwd(), 'assets', 'exact', screen);
    const files = fs.readdirSync(directory)
      .filter(name => /^\d+\.txt$/i.test(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (!files.length) {
      res.status(404).json({ error: 'Artwork not found.' });
      return;
    }

    const encoded = files
      .map(name => fs.readFileSync(path.join(directory, name), 'utf8').trim())
      .join('');

    const image = Buffer.from(encoded, 'base64');

    if (!image.length) {
      res.status(500).json({ error: 'Artwork could not be decoded.' });
      return;
    }

    // The approved source artwork is AVIF (ftypavif), not WebP.
    res.setHeader('Content-Type', 'image/avif');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('Content-Length', String(image.length));
    res.status(200).send(image);
  } catch (error) {
    console.error('Artwork endpoint failed:', error);
    res.status(500).json({ error: 'Artwork endpoint failed.' });
  }
}
