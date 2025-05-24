import { MerkleTree } from 'merkletreejs';
import { ethers } from 'ethers';
import fs from 'fs';

interface TokenOwner {
  tokenId: number;
  owner: string;
}

// Function to generate Merkle tree from snapshot data
async function generateMerkleTree(snapshotData: TokenOwner[]): Promise<MerkleTree> {
  // Create leaves for the Merkle tree
  const leaves = snapshotData.map((entry) => {
    // Hash the combination of tokenId and owner address
    return ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['uint256', 'address'],
        [entry.tokenId, entry.owner]
      )
    );
  });

  // Create and return the Merkle tree
  return new MerkleTree(leaves, ethers.utils.keccak256, { sortPairs: true });
}

// Function to generate Merkle proof for a specific tokenId and owner
function generateMerkleProof(tree: MerkleTree, tokenId: number, owner: string): string[] {
  const leaf = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'address'],
      [tokenId, owner]
    )
  );
  return tree.getHexProof(leaf);
}

// Main function to process snapshot data and generate Merkle tree
async function main() {
  try {
    console.log('Generating Merkle Tree from snapshot data...');
    
    // Load snapshot data (this would be your exported data from Zora)
    if (!fs.existsSync('./data/zoraSnapshot.json')) {
      throw new Error('Snapshot file not found. Run getZoraSnapshot.ts first.');
    }
    
    const snapshotDataRaw = fs.readFileSync('./data/zoraSnapshot.json', 'utf8');
    const snapshotData: TokenOwner[] = JSON.parse(snapshotDataRaw);
    
    console.log(`Processing ${snapshotData.length} tokens from snapshot...`);

    // Generate the Merkle tree
    const merkleTree = await generateMerkleTree(snapshotData);
    
    // Get the Merkle root
    const merkleRoot = merkleTree.getHexRoot();
    
    console.log('Merkle Root:', merkleRoot);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data');
    }
    
    // Save the Merkle root to a file for later use in deployment
    fs.writeFileSync('./data/merkleRoot.json', JSON.stringify({ merkleRoot }));
    
    // For demonstration, generate a proof for the first token in the snapshot
    if (snapshotData.length > 0) {
      const firstEntry = snapshotData[0];
      const proof = generateMerkleProof(merkleTree, firstEntry.tokenId, firstEntry.owner);
      console.log(`Proof for token ${firstEntry.tokenId} owned by ${firstEntry.owner}:`, proof);
    }
    
    // Save all proofs to a file for easy access
    const proofs = snapshotData.map(entry => ({
      tokenId: entry.tokenId,
      owner: entry.owner,
      proof: generateMerkleProof(merkleTree, entry.tokenId, entry.owner)
    }));
    
    fs.writeFileSync('./data/merkleProofs.json', JSON.stringify(proofs, null, 2));
    
    console.log('Merkle proofs generated and saved successfully!');
  } catch (error) {
    console.error('Error generating Merkle tree:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 