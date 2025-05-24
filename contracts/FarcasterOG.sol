// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title FarcasterOG
 * @dev FarcasterOG NFT contract for Base chain
 * @author @shonalabs
 */
contract FarcasterOG is ERC721Enumerable, Ownable {
    using Strings for uint256;

    // Token metadata
    string public baseURI;
    
    // Royalties in basis points 
    uint256 public royaltyBasisPoints;
    address public royaltyReceiver;

    // Max supply based on Zora snapshot
    uint256 public immutable maxSupply;
    
    // MerkleClaim contract address
    address public merkleClaimContract;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initialBaseURI,
        uint256 _royaltyBasisPoints,
        address _royaltyReceiver,
        uint256 _maxSupply
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        baseURI = _initialBaseURI;
        royaltyBasisPoints = _royaltyBasisPoints;
        royaltyReceiver = _royaltyReceiver;
        maxSupply = _maxSupply;
    }
    
    /**
     * @dev Sets the MerkleClaim contract
     * @param _merkleClaimContract Address of the MerkleClaim contract
     */
    function setMerkleClaimContract(address _merkleClaimContract) external onlyOwner {
        merkleClaimContract = _merkleClaimContract;
    }

    /**
     * @dev Returns the base URI for token metadata
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
     * @dev Sets the base URI for token metadata
     * @param _newBaseURI The new base URI
     */
    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
    }

    /**
     * @dev Updates royalty information
     * @param _royaltyBasisPoints New royalty percentage in basis points
     * @param _royaltyReceiver New royalty receiver address
     */
    function setRoyaltyInfo(uint256 _royaltyBasisPoints, address _royaltyReceiver) external onlyOwner {
        royaltyBasisPoints = _royaltyBasisPoints;
        royaltyReceiver = _royaltyReceiver;
    }

    /**
     * @dev EIP-2981 royalty standard implementation
     */
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view returns (address, uint256) {
        require(_exists(_tokenId), "Token does not exist");
        return (royaltyReceiver, (_salePrice * royaltyBasisPoints) / 10000);
    }

    /**
     * @dev Checks if a token exists
     * @param tokenId The token ID to check
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Mint a new token - can only be called by the MerkleClaim contract
     * @param to The address that will receive the minted token
     * @param tokenId The token ID to mint
     */
    function mintToken(address to, uint256 tokenId) external {
        require(msg.sender == merkleClaimContract, "Only MerkleClaim contract can mint");
        require(tokenId > 0 && tokenId <= maxSupply, "Invalid token ID");
        require(!_exists(tokenId), "Token already minted");
        
        _safeMint(to, tokenId);
    }
} 