// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FarcasterOG.sol";

/**
 * @title MerkleClaim
 * @dev Contract for claiming FarcasterOG NFTs on Base using Merkle proofs
 * @author @shonalabs
 */
contract MerkleClaim is Ownable {
    // The FarcasterOG NFT contract
    FarcasterOG public farcasterOG;
    
    // The Merkle root of the snapshot data
    bytes32 public merkleRoot;
    
    // Mapping to track claimed tokens
    mapping(uint256 => bool) public claimed;

    // Event emitted when a token is claimed
    event TokenClaimed(address indexed claimer, uint256 tokenId);
    
    // Event emitted when the Merkle root is updated
    event MerkleRootUpdated(bytes32 merkleRoot);

    constructor(
        address _farcasterOG,
        bytes32 _merkleRoot
    ) Ownable(msg.sender) {
        farcasterOG = FarcasterOG(_farcasterOG);
        merkleRoot = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot);
    }

    /**
     * @dev Updates the Merkle root
     * @param _merkleRoot New Merkle root
     */
    function updateMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot);
    }

    /**
     * @dev Claim a token using a Merkle proof
     * @param tokenId The token ID to claim
     * @param proof The Merkle proof validating ownership
     */
    function claimToken(uint256 tokenId, bytes32[] calldata proof) external {
        // Ensure token hasn't been claimed already
        require(!claimed[tokenId], "Token already claimed");
        
        // Verify the Merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(tokenId, msg.sender));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid Merkle proof");
        
        // Mark token as claimed
        claimed[tokenId] = true;
        
        // Mint the token to the claimer
        farcasterOG.mintToken(msg.sender, tokenId);
        
        emit TokenClaimed(msg.sender, tokenId);
    }
} 