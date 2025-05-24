import { ethers } from 'ethers';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// ABI for FarcasterOG NFT contract on Zora
const FARCASTER_OG_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function totalSupply() view returns (uint256)'
];

// Main function to get snapshot data from Zora
async function main() {
  try {
    // Get environment variables
    const ZORA_RPC_URL = process.env.ZORA_RPC_URL;
    const FARCASTER_OG_ADDRESS = process.env.ZORA_FARCASTER_OG_ADDRESS;
    
    if (!ZORA_RPC_URL || !FARCASTER_OG_ADDRESS) {
      throw new Error('Missing environment variables. Please set ZORA_RPC_URL and ZORA_FARCASTER_OG_ADDRESS.');
    }
    
    console.log('Taking snapshot from Zora chain...');
    
    // Connect to Zora network
    const provider = new ethers.providers.JsonRpcProvider(ZORA_RPC_URL);
    
    // Create contract instance
    const farcasterOgContract = new ethers.Contract(
      FARCASTER_OG_ADDRESS,
      FARCASTER_OG_ABI,
      provider
    );
    
    // Get total supply
    const totalSupply = await farcasterOgContract.totalSupply();
    console.log(`Total supply: ${totalSupply}`);
    
    // Create array to store token owners
    const tokenOwners = [];
    
    // Loop through all tokens and get their owners
    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
      try {
        const owner = await farcasterOgContract.ownerOf(tokenId);
        tokenOwners.push({
          tokenId,
          owner
        });
        
        // Log progress
        if (tokenId % 100 === 0) {
          console.log(`Processed ${tokenId}/${totalSupply} tokens`);
        }
      } catch (error) {
        console.error(`Error getting owner for token ${tokenId}:`, error);
      }
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data');
    }
    
    // Save snapshot data to file
    fs.writeFileSync('./data/zoraSnapshot.json', JSON.stringify(tokenOwners, null, 2));
    
    console.log(`Snapshot complete. ${tokenOwners.length} tokens saved to ./data/zoraSnapshot.json`);
  } catch (error) {
    console.error('Error getting Zora snapshot:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 