import { ethers } from 'hardhat';
import fs from 'fs';

async function main() {
  try {
    console.log('Starting deployment to Base chain...');
    
    // Cek signer
    const signers = await ethers.getSigners();
    if (!signers[0]) {
      throw new Error('No signer found. Check your PRIVATE_KEY and network config.');
    }
    console.log('Signer:', signers[0].address);
    
    // Load Merkle root from generated file
    if (!fs.existsSync('./data/merkleRoot.json')) {
      throw new Error('merkleRoot.json file not found. Run generateMerkleRoot.ts first.');
    }
    
    const merkleRootData = JSON.parse(fs.readFileSync('./data/merkleRoot.json', 'utf8'));
    const merkleRoot = merkleRootData.merkleRoot;
    
    // Load snapshot data to get total supply
    if (!fs.existsSync('./data/zoraSnapshot.json')) {
      throw new Error('zoraSnapshot.json file not found. Run getZoraSnapshot.ts first.');
    }
    
    const snapshotData = JSON.parse(fs.readFileSync('./data/zoraSnapshot.json', 'utf8'));
    const maxSupply = snapshotData.length;
    
    console.log(`Deploying FarcasterOG contract with max supply: ${maxSupply}`);
    console.log(`Using Merkle root: ${merkleRoot}`);
    
    // Royalty settings
    const royaltyBasisPoints = 500; // 5%
    const royaltyReceiver = '0xBC698ce1933aFb2980D4A5a0F85feA1b02fbb1c9';
    
    console.log(`Royalty settings: ${royaltyBasisPoints/100}% to ${royaltyReceiver}`);
    
    // IPFS metadata settings
    // All tokens use the same image and metadata (no attributes)
    const baseURI = 'ipfs://QmXj6BmdPKtFsfev7oTSGRXvgEunzXtwi8ua6CCg7sp4SM/';
    console.log(`Using metadata baseURI: ${baseURI}`);
    
    // Deploy FarcasterOG contract
    const FarcasterOG = await ethers.getContractFactory('FarcasterOG');
    const farcasterOG = await FarcasterOG.deploy(
      'Farcaster OG', // Name
      'FCOG',         // Symbol
      baseURI,        // BaseURI pointing to new IPFS folder
      royaltyBasisPoints, // Royalty basis points (5%)
      royaltyReceiver,    // Royalty receiver address
      maxSupply
    );
    
    await farcasterOG.deployed();
    console.log(`FarcasterOG successfully deployed at address: ${farcasterOG.address}`);
    
    // Deploy MerkleClaim contract
    const MerkleClaim = await ethers.getContractFactory('MerkleClaim');
    const merkleClaim = await MerkleClaim.deploy(
      farcasterOG.address,
      merkleRoot
    );
    
    await merkleClaim.deployed();
    console.log(`MerkleClaim successfully deployed at address: ${merkleClaim.address}`);
    
    // Set MerkleClaim contract in FarcasterOG
    const setMerkleClaimTx = await farcasterOG.setMerkleClaimContract(merkleClaim.address);
    await setMerkleClaimTx.wait();
    console.log('MerkleClaim contract successfully set in FarcasterOG');
    
    // Save contract addresses to file for future reference
    const deploymentInfo = {
      network: process.env.HARDHAT_NETWORK || 'unknown',
      farcasterOG: farcasterOG.address,
      merkleClaim: merkleClaim.address,
      royaltyBasisPoints: royaltyBasisPoints,
      royaltyReceiver: royaltyReceiver,
      baseURI: baseURI,
      timestamp: new Date().toISOString()
    };
    
    if (!fs.existsSync('./deployments')) {
      fs.mkdirSync('./deployments');
    }
    
    fs.writeFileSync(
      `./deployments/deployment-${deploymentInfo.network}-${deploymentInfo.timestamp.split('T')[0]}.json`, 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log('Deployment complete. Deployment information saved in ./deployments folder');
    console.log('You can now verify contracts on Etherscan/Basescan.');
  } catch (error) {
    console.error('Error during deployment:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 