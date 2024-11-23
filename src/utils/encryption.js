import { ethers } from 'ethers'

export class EncryptionService {
  static async generateKeyPair() {
    const wallet = ethers.Wallet.createRandom()
    return {
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey
    }
  }

  static async encryptChunk(chunk, publicKey) {
    // Convert the chunk to bytes
    const chunkBytes = ethers.utils.toUtf8Bytes(chunk)
    
    // Use public key encryption (this is a simplified version)
    // In a real implementation, you would use a proper encryption algorithm
    const encrypted = ethers.utils.keccak256(chunkBytes)
    
    return encrypted
  }

  static async decryptChunk(encryptedChunk, privateKey) {
    // In a real implementation, you would use the private key to decrypt
    // This is a placeholder implementation
    return ethers.utils.toUtf8String(encryptedChunk)
  }

  static splitIntoChunks(text, numWitnesses) {
    const chunkSize = Math.ceil(text.length / numWitnesses)
    const chunks = []
    
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize))
    }
    
    return chunks
  }

  static async encryptLegacy(lastWords, witnesses) {
    const chunks = this.splitIntoChunks(lastWords, witnesses.length)
    const encryptedChunks = []
    
    for (let i = 0; i < chunks.length; i++) {
      const encryptedChunk = await this.encryptChunk(chunks[i], witnesses[i].publicKey)
      encryptedChunks.push({
        witnessAddress: witnesses[i].address,
        encryptedContent: encryptedChunk
      })
    }
    
    return encryptedChunks
  }

  static async decryptLegacy(encryptedChunks, privateKeys) {
    let decryptedText = ''
    
    for (const chunk of encryptedChunks) {
      const privateKey = privateKeys[chunk.witnessAddress]
      if (!privateKey) continue
      
      const decryptedChunk = await this.decryptChunk(chunk.encryptedContent, privateKey)
      decryptedText += decryptedChunk
    }
    
    return decryptedText
  }
}
