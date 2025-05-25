import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { nfts } from '../abis/nfts'
import { merkleAbi } from '../abis/merkle'
import { verifyProof } from '../merkle/utils'
import { merkleRoot } from '../merkle/merkleRoot'

// Kontrak addresses dari deployment
const FARCASTER_OG_ADDRESS = '0xd6226Eb26A1306DAA2Ca96752DF3A0E62ef6b289'
const MERKLE_CLAIM_ADDRESS = '0x02a837A421101eb874CcfA20F3c1921f3f62D1b9'

export const useNFTContract = () => {
  const { address } = useAccount()

  // Untuk membaca data NFT
  const { data: balanceOf, isLoading: isBalanceLoading } = useReadContract({
    address: FARCASTER_OG_ADDRESS,
    abi: nfts,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: {
      enabled: !!address,
    },
  })

  // Untuk membaca total supply
  const { data: totalSupply, isLoading: isTotalSupplyLoading } = useReadContract({
    address: FARCASTER_OG_ADDRESS,
    abi: nfts,
    functionName: 'totalSupply',
  })

  // Untuk membaca base URI
  const { data: baseURI } = useReadContract({
    address: FARCASTER_OG_ADDRESS,
    abi: nfts,
    functionName: 'baseURI',
  })

  return { 
    balanceOf, 
    totalSupply, 
    baseURI, 
    isBalanceLoading, 
    isTotalSupplyLoading
  }
}

// Custom hook untuk mengecek status klaim token
export const useTokenClaimStatus = (tokenId: number) => {
  const { data: isClaimed, isLoading: isClaimedLoading } = useReadContract({
    address: MERKLE_CLAIM_ADDRESS,
    abi: merkleAbi,
    functionName: 'claimed',
    args: [BigInt(tokenId || 0)],
    query: {
      enabled: !!tokenId,
    },
  })

  return { isClaimed, isClaimedLoading }
}

export const useMerkleClaim = () => {
  const { writeContractAsync, isPending, isError, error, isSuccess } = useWriteContract()
  const { address } = useAccount()

  const claimToken = async (tokenId: number, proof: `0x${string}`[]) => {
    if (!address) throw new Error('Wallet not connected')
    
    console.log('Claiming token', tokenId, 'with proof:', proof)
    
    try {
      // Verifikasi proof di client-side sebelum mengirim transaksi
      // Ini membantu mencegah transaksi yang akan gagal
      const isValidProof = verifyProof(tokenId, address, proof as string[], merkleRoot)
      
      if (!isValidProof) {
        console.error('Invalid merkle proof! Transaction would fail on-chain')
        throw new Error('Invalid merkle proof. Please check if you are eligible to claim this token.')
      }
      
      console.log('Proof valid, submitting transaction...')
      
      return await writeContractAsync({
        address: MERKLE_CLAIM_ADDRESS,
        abi: merkleAbi,
        functionName: 'claimToken',
        args: [BigInt(tokenId), proof],
      })
    } catch (error) {
      console.error('Error claiming token:', error)
      throw error
    }
  }

  // Fungsi untuk memverifikasi proof tanpa mengirim transaksi
  const verifyTokenProof = (tokenId: number, proof: `0x${string}`[]) => {
    if (!address) return false
    return verifyProof(tokenId, address, proof as string[], merkleRoot)
  }

  return { claimToken, verifyTokenProof, isPending, isError, error, isSuccess }
} 