import fs from 'fs';
import path from 'path';

// Konfigurasi metadata
const OUTPUT_DIR = './data/metadata';
const IMAGE_IPFS = 'https://orange-familiar-tahr-879.mypinata.cloud/ipfs/bafybeieqxwvykybphcdydy4e3thti3vhzndqioqewfgkdht7gmxtbuotji';
const DESCRIPTION = 'Celebrating Farcaster at permissionless.';
const NAME_PREFIX = 'Farcaster OG';

// Ganti sesuai jumlah NFT yang ingin digenerate
const TOTAL_SUPPLY = 938; 

function main() {
  // Pastikan folder output ada
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (let i = 1; i <= TOTAL_SUPPLY; i++) {
    const metadata = {
      name: `${NAME_PREFIX} ${i}`,
      description: DESCRIPTION,
      image: IMAGE_IPFS
    };
    const filePath = path.join(OUTPUT_DIR, `${i}.json`);
    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
  }

  console.log(`Generated ${TOTAL_SUPPLY} metadata files in ${OUTPUT_DIR}`);
}

main(); 