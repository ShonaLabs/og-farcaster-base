import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from 'merkletreejs';
import { calculateLeaf } from '../mini-apps/src/merkle/utils';
import fs from 'fs';
import path from 'path';

describe("Merkle Utils Test", function () {
  // Test accounts
  let owner: any;
  let user1: any;
  let user2: any;
  let ownerAddress: string;
  let user1Address: string;
  let user2Address: string;

  // Merkle data
  let merkleTree: MerkleTree;
  let merkleRoot: string;
  
  // Load snapshot data
  const snapshotPath = path.join(__dirname, '../data/zoraSnapshot.json');
  const snapshotData = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  
  // Test sample (using first 10 tokens from actual snapshot)
  const testTokens = snapshotData.slice(0, 10);

  before(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();
  });

  describe("Leaf Node Calculation", function() {
    it("Should calculate leaf nodes with abi.encodePacked simulation", async function() {
      for (const token of testTokens) {
        const tokenId = token.tokenId;
        const owner = token.owner;
        
        // Metode 1: Menggunakan utils dari frontend (solidityPack)
        const frontendLeaf = calculateLeaf(tokenId, owner);
        
        // Metode 2: Menggunakan defaultAbiCoder langsung
        const directLeaf = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ['uint256', 'address'],
            [tokenId, owner]
          )
        );
        
        console.log(`Token ${tokenId} Owner ${owner}`);
        console.log(`Frontend leaf: ${frontendLeaf}`);
        console.log(`Direct leaf: ${directLeaf}`);
        
        // Kedua metode harus menghasilkan hasil yang sama
        expect(frontendLeaf.toLowerCase()).to.equal(directLeaf.toLowerCase());
      }
    });
    
    it("Should generate different leaf nodes when using defaultAbiCoder vs solidityPack", async function() {
      const testToken = testTokens[0];
      const tokenId = testToken.tokenId;
      const owner = testToken.owner;
      
      // Menggunakan solidityPack (simulasi abi.encodePacked)
      const solidityPackLeaf = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ['uint256', 'address'],
          [tokenId, owner]
        )
      );
      
      // Menggunakan defaultAbiCoder (yang digunakan di script asli)
      const abiCoderLeaf = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['uint256', 'address'],
          [tokenId, owner]
        )
      );
      
      console.log("\nEncoding comparison:");
      console.log(`solidityPack leaf: ${solidityPackLeaf}`);
      console.log(`defaultAbiCoder leaf: ${abiCoderLeaf}`);
      
      // Kedua metode seharusnya menghasilkan nilai yang berbeda
      expect(solidityPackLeaf.toLowerCase()).to.not.equal(abiCoderLeaf.toLowerCase());
    });
  });
  
  describe("Merkle Tree & Proof Generation", function() {
    it("Should create correct merkle tree and proofs with solidityPack", async function() {
      // Generate leaves using solidityPack (simulasi abi.encodePacked)
      const leaves = testTokens.map((token: {tokenId: number, owner: string}) => 
        ethers.utils.keccak256(
          ethers.utils.solidityPack(
            ['uint256', 'address'],
            [token.tokenId, token.owner]
          )
        )
      );
      
      // Create merkle tree
      merkleTree = new MerkleTree(leaves, ethers.utils.keccak256, { sortPairs: true });
      merkleRoot = merkleTree.getHexRoot();
      
      console.log("\nMerkle Tree from solidityPack:");
      console.log(`Root: ${merkleRoot}`);
      
      // Verify merkle proof for each test token
      for (const token of testTokens) {
        const leaf = ethers.utils.keccak256(
          ethers.utils.solidityPack(
            ['uint256', 'address'],
            [token.tokenId, token.owner]
          )
        );
        
        const proof = merkleTree.getHexProof(leaf);
        
        // Verifikasi proof
        const isValid = merkleTree.verify(proof, leaf, merkleRoot);
        
        console.log(`\nToken ${token.tokenId} Owner ${token.owner}`);
        console.log(`Leaf: ${leaf}`);
        console.log(`Proof length: ${proof.length}`);
        console.log(`Is valid: ${isValid}`);
        
        expect(isValid).to.equal(true);
      }
    });
    
    it("Should reject proofs for incorrect token owner combinations", async function() {
      // Use an incorrect owner for a token
      const testToken = testTokens[0];
      const tokenId = testToken.tokenId;
      const wrongOwner = user1Address; // Different from actual owner
      
      // Get leaf for incorrect token-owner combination
      const leaf = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ['uint256', 'address'],
          [tokenId, wrongOwner]
        )
      );
      
      // Get proof for correct token-owner
      const correctLeaf = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ['uint256', 'address'],
          [tokenId, testToken.owner]
        )
      );
      const proof = merkleTree.getHexProof(correctLeaf);
      
      // Verify proof with wrong owner (should fail)
      const isValid = merkleTree.verify(proof, leaf, merkleRoot);
      
      console.log("\nInvalid proof test:");
      console.log(`Token ${tokenId} Wrong owner ${wrongOwner}`);
      console.log(`Is valid (should be false): ${isValid}`);
      
      expect(isValid).to.equal(false);
    });
  });
  
  describe("Compare with Original Script Implementation", function() {
    it("Should demonstrate why current merkle root doesn't match with contract verification", async function() {
      // Implementasi dari script asli (generateMerkleRoot.ts)
      const originalLeaves = testTokens.map((token: {tokenId: number, owner: string}) => 
        ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ['uint256', 'address'],
            [token.tokenId, token.owner]
          )
        )
      );
      
      // Create merkle tree with original method
      const originalTree = new MerkleTree(originalLeaves, ethers.utils.keccak256, { sortPairs: true });
      const originalRoot = originalTree.getHexRoot();
      
      console.log("\nComparing implementations:");
      console.log(`Original script root: ${originalRoot}`);
      console.log(`Contract compatible root: ${merkleRoot}`);
      
      // Roots should be different
      expect(originalRoot.toLowerCase()).to.not.equal(merkleRoot.toLowerCase());
      
      // Take first token as example
      const token = testTokens[0];
      
      // Generate leaf node using both methods
      const originalLeaf = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['uint256', 'address'],
          [token.tokenId, token.owner]
        )
      );
      
      const contractLeaf = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ['uint256', 'address'],
          [token.tokenId, token.owner]
        )
      );
      
      // Generate proofs using both trees
      const originalProof = originalTree.getHexProof(originalLeaf);
      const contractProof = merkleTree.getHexProof(contractLeaf);
      
      console.log("\nToken verification with different encodings:");
      console.log(`Original proof length: ${originalProof.length}`);
      console.log(`Contract proof length: ${contractProof.length}`);
      
      // Verify cross-compatibility (should fail)
      const originalLeafWithContractProof = originalTree.verify(contractProof, originalLeaf, originalRoot);
      const contractLeafWithOriginalProof = merkleTree.verify(originalProof, contractLeaf, merkleRoot);
      
      console.log(`Original leaf with contract proof valid: ${originalLeafWithContractProof}`);
      console.log(`Contract leaf with original proof valid: ${contractLeafWithOriginalProof}`);
      
      // Both should be false - proofs aren't interchangeable between different encoding methods
      expect(originalLeafWithContractProof).to.equal(false);
      expect(contractLeafWithOriginalProof).to.equal(false);
    });
  });
}); 