'use client'

import { useEffect } from 'react'
import Image from "next/image"
import { sdk } from '@farcaster/frame-sdk'
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAccount } from 'wagmi'
import { useMerkleClaim } from '@/hooks/useContract'
import { merkleProofs } from '@/merkle/merkleProofs'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { claimToken } = useMerkleClaim()

  // Initialize and mark app as ready
  useEffect(() => {
    const initApp = async () => {
      try {
        await sdk.actions.ready()
      } catch (error) {
        console.error('Error initializing app:', error)
      }
    }

    initApp()
  }, [])

  // Find user proof if connected
  const userProof = address && merkleProofs ? 
    merkleProofs.find(p => p.owner.toLowerCase() === address.toLowerCase()) : null

  // Handle claim function
  const handleClaim = async () => {
    if (!address || !userProof) return
    
    try {
      // Convert readonly array to mutable array
      const mutableProof = Array.from(userProof.proof) as `0x${string}`[]
      await claimToken(userProof.tokenId, mutableProof)
      
      // Create cast about successful claim
      try {
        await sdk.actions.composeCast({ text: `I just claimed Farcaster OG NFT token ID ${userProof.tokenId} on Base! 🎉` })
      } catch (castError) {
        console.error('Error composing cast:', castError)
      }
    } catch (error) {
      console.error('Error claiming token:', error)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-900 text-white overflow-hidden">
      {/* Header */}
      <div className="w-full py-4 px-6 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Migrate Farcaster OG</h1>

        <div className="flex items-center gap-2">
          {/* Repo Link */}
          <a 
            href="https://github.com/user/FarcasterOG" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors" 
            aria-label="Repository"
          >
            <Github className="h-5 w-5 text-zinc-300" />
          </a>

          {/* About Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors" aria-label="About">
                <Info className="h-5 w-5 text-zinc-300" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-800 border-zinc-700 text-white max-w-[90vw] sm:max-w-md mx-4">
              <DialogHeader>
                <DialogTitle className="text-white">About</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm text-zinc-300">
                <p>
                  This mini app is an implementation of a bounty from cojo.eth for migrating Farcaster OG NFT from Zora
                  chain to Base using snapshot and merkle proof.
                </p>
                <div>
                  <span className="text-zinc-400">Bounty Details:</span>
                  <a
                    href="https://farcaster.xyz/cojo.eth/0xe8f0f76e"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors ml-2 inline-flex items-center gap-1"
                  >
                    View on Farcaster
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content - Single Screen */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full px-6">
          {/* Image */}
          <div className="mb-6">
            <div className="w-64 h-64 mx-auto bg-zinc-800 border-2 border-zinc-700 rounded-2xl flex items-center justify-center">
              <Image
                src="/FarcasterOG.png"
                alt="Farcaster OG NFT"
                width={250}
                height={250}
                className="rounded-xl object-cover"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Farcaster OG NFT</h3>
            <p className="text-zinc-300 mb-4">
              Celebrating Farcaster at permissionless
            </p>
          </div>

          {/* Links Section */}
          <div className="space-y-6 mb-6">
            {/* Contracts */}
            <div className="py-3 px-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
              <div className="mb-4">
                <span className="text-zinc-200 font-medium">Contracts</span>
              </div>

              <div className="space-y-3 ml-0">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-zinc-400 text-sm font-medium">farcasterOG</span>
                    <span className="text-zinc-300 text-xs font-mono mt-1 truncate">
                      0xd6226Eb26A1306DAA2Ca96752DF3A0E62ef6b289
                    </span>
                  </div>
                  <a 
                    href="https://basescan.org/address/0xd6226Eb26A1306DAA2Ca96752DF3A0E62ef6b289#code" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300 transition-colors p-1 ml-3"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-zinc-400 text-sm font-medium">merkleClaim</span>
                    <span className="text-zinc-300 text-xs font-mono mt-1 truncate">
                      0x02a837A421101eb874CcfA20F3c1921f3f62D1b9
                    </span>
                  </div>
                  <a 
                    href="https://basescan.org/address/0x02a837A421101eb874CcfA20F3c1921f3f62D1b9#code" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300 transition-colors p-1 ml-3"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Migrate Button */}
          <div className="flex justify-center">
            {!isConnected ? (
              <Button
                size="lg"
                className="bg-[#615FFF] hover:bg-[#4f4dcc] text-white px-12 py-3 rounded-xl font-semibold shadow-lg shadow-[#615FFF]/30 hover:shadow-[#4f4dcc]/40 transition-all duration-200"
                onClick={async () => {
                  try {
                    await sdk.wallet.getEthereumProvider()
                  } catch (error) {
                    console.error('Error connecting wallet:', error)
                  }
                }}
              >
                Connect Wallet
              </Button>
            ) : userProof ? (
              <Button
                onClick={handleClaim}
                size="lg"
                className="bg-[#615FFF] hover:bg-[#4f4dcc] text-white px-12 py-3 rounded-xl font-semibold shadow-lg shadow-[#615FFF]/30 hover:shadow-[#4f4dcc]/40 transition-all duration-200"
              >
                Migrate
              </Button>
            ) : (
              <Button
                disabled
                size="lg"
                className="bg-zinc-700 text-zinc-400 px-12 py-3 rounded-xl font-semibold cursor-not-allowed"
              >
                Not Eligible
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
