import { ethers } from 'ethers'

// Fungsi untuk menghitung leaf dari tokenId dan alamat
export function calculateLeaf(tokenId: number, address: string): string {
  // Menggunakan defaultAbiCoder seperti di script generateMerkleRoot.ts asli
  // Agar kompatibel dengan merkle root yang sudah ada di kontrak
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'address'],
      [tokenId, address]
    )
  )
}

// Fungsi untuk verifikasi merkle proof
export function verifyProof(
  tokenId: number, 
  address: string, 
  proof: string[], 
  root: string
): boolean {
  try {
    const leaf = calculateLeaf(tokenId, address)
    
    // Implementasi verifikasi proof standard
    let computedHash = leaf
    
    for (const proofElement of proof) {
      // Gunakan algoritma persis seperti di OpenZeppelin MerkleProof library
      if (computedHash < proofElement) {
        computedHash = ethers.utils.keccak256(
          ethers.utils.concat([
            ethers.utils.arrayify(computedHash),
            ethers.utils.arrayify(proofElement)
          ])
        )
      } else {
        computedHash = ethers.utils.keccak256(
          ethers.utils.concat([
            ethers.utils.arrayify(proofElement),
            ethers.utils.arrayify(computedHash)
          ])
        )
      }
    }
    
    return computedHash.toLowerCase() === root.toLowerCase()
  } catch (error) {
    console.error('Error verifying proof:', error)
    return false
  }
}

// Fungsi untuk logging yang membantu debugging
export function logMerkleDebugInfo(
  tokenId: number, 
  address: string, 
  proof: string[], 
  root: string
): void {
  try {
    console.log('Debug Merkle Verification:')
    console.log('Token ID:', tokenId)
    console.log('Address:', address)
    
    const leaf = calculateLeaf(tokenId, address)
    console.log('Calculated Leaf:', leaf)
    console.log('Merkle Root:', root)
    
    const isValid = verifyProof(tokenId, address, proof, root)
    console.log('Proof Valid?', isValid)
  } catch (error) {
    console.error('Error in merkle debug logging:', error)
  }
} 