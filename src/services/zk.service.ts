import crypto from 'crypto';

export interface ZkProof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  publicSignals: string[];
}

const CRS_SECRET = process.env.ZK_CRS_SECRET || 'izumi-zk-crs-secret-key-2026';

export class ZkService {
  /**
   * Simulates client-side KYC ZK-SNARK proof generation.
   * Proves that a user possesses a valid 11-digit BVN and binds the proof to their wallet address.
   * The proof does not reveal the BVN itself.
   */
  async generateKycProof(bvn: string, walletAddress: string): Promise<ZkProof> {
    // Validate inputs
    if (bvn.length !== 11 || !/^\d+$/.test(bvn)) {
      throw new Error('Invalid BVN format. Cannot generate ZK proof.');
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Public inputs/signals
    // publicSignals[0] = Commitment = HASH(bvn + walletAddress)
    const commitment = crypto
      .createHash('sha256')
      .update(`${bvn}:${normalizedAddress}`)
      .digest('hex');

    // Create elliptic curve G1/G2 elements simulating a SnarkJS Groth16 output.
    // We sign the commitment using our CRS secret key to simulate the proving key generation.
    const signature = crypto
      .createHmac('sha256', CRS_SECRET)
      .update(commitment)
      .digest('hex');

    // Slice the signature to populate mock G1/G2 coordinates
    const x_a = `0x${signature.substring(0, 16)}`;
    const y_a = `0x${signature.substring(16, 32)}`;
    const x_c = `0x${signature.substring(32, 48)}`;
    const y_c = `0x${signature.substring(48, 64)}`;

    return {
      pi_a: [x_a, y_a, '1'],
      pi_b: [
        [`0x${x_a.slice(2).split('').reverse().join('')}`, '0x01'],
        [`0x${y_a.slice(2).split('').reverse().join('')}`, '0x02'],
        ['1', '0']
      ],
      pi_c: [x_c, y_c, '1'],
      publicSignals: [commitment, normalizedAddress]
    };
  }

  /**
   * Verifies an incoming KYC ZK-SNARK proof.
   * Ensures the proof was generated using the correct CRS setup and binds to the correct wallet address.
   */
  async verifyKycProof(proof: ZkProof, walletAddress: string): Promise<boolean> {
    try {
      // 1. Structure Checks
      if (
        !proof.pi_a || proof.pi_a.length !== 3 ||
        !proof.pi_b || proof.pi_b.length !== 3 ||
        !proof.pi_c || proof.pi_c.length !== 3 ||
        !proof.publicSignals || proof.publicSignals.length !== 2
      ) {
        console.warn('ZK Verification Failed: Invalid SNARK proof structure.');
        return false;
      }

      const [commitment, normalizedAddress] = proof.publicSignals;

      // 2. Binding Check: Prevent proof replay/front-running by checking if the proof binds to the sender address
      if (normalizedAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        console.warn(`ZK Verification Failed: Proof binds to address ${normalizedAddress}, but sender is ${walletAddress}`);
        return false;
      }

      // 3. Cryptographic Signature/Verification check
      const expectedSignature = crypto
        .createHmac('sha256', CRS_SECRET)
        .update(commitment)
        .digest('hex');

      const x_a = `0x${expectedSignature.substring(0, 16)}`;
      const y_a = `0x${expectedSignature.substring(16, 32)}`;
      const x_c = `0x${expectedSignature.substring(32, 48)}`;
      const y_c = `0x${expectedSignature.substring(48, 64)}`;

      // Assert G1 parameters in proof match calculations from CRS proving setup
      if (proof.pi_a[0] !== x_a || proof.pi_a[1] !== y_a || proof.pi_c[0] !== x_c || proof.pi_c[1] !== y_c) {
        console.warn('ZK Verification Failed: Proof signature verification failed (invalid zk-SNARK parameters).');
        return false;
      }

      return true;
    } catch (err) {
      console.error('ZK Service Error:', err);
      return false;
    }
  }

  /**
   * Simulates client-side Credit scoring ZK-SNARK proof generation.
   * Proves that a business holds a certified score and limit under the protocol's scoring algorithm hash.
   */
  async generateCreditProof(userId: string, score: number, limit: number): Promise<ZkProof> {
    const commitment = crypto
      .createHash('sha256')
      .update(`${userId}:${score}:${limit}`)
      .digest('hex');

    const signature = crypto
      .createHmac('sha256', CRS_SECRET)
      .update(commitment)
      .digest('hex');

    const x_a = `0x${signature.substring(0, 16)}`;
    const y_a = `0x${signature.substring(16, 32)}`;
    const x_c = `0x${signature.substring(32, 48)}`;
    const y_c = `0x${signature.substring(48, 64)}`;

    return {
      pi_a: [x_a, y_a, '1'],
      pi_b: [
        [`0x${x_a.slice(2).split('').reverse().join('')}`, '0x01'],
        [`0x${y_a.slice(2).split('').reverse().join('')}`, '0x02'],
        ['1', '0']
      ],
      pi_c: [x_c, y_c, '1'],
      publicSignals: [commitment, userId, score.toString(), limit.toString()]
    };
  }

  /**
   * Verifies the credit scoring proof.
   */
  async verifyCreditProof(
    proof: ZkProof,
    userId: string,
    expectedScore: number,
    expectedLimit: number
  ): Promise<boolean> {
    try {
      if (
        !proof.pi_a || proof.pi_a.length !== 3 ||
        !proof.pi_b || proof.pi_b.length !== 3 ||
        !proof.pi_c || proof.pi_c.length !== 3 ||
        !proof.publicSignals || proof.publicSignals.length !== 4
      ) {
        console.warn('ZK Credit Verification Failed: Invalid SNARK proof structure.');
        return false;
      }

      const [commitment, proofUserId, proofScore, proofLimit] = proof.publicSignals;

      // 1. Verify that the commitment matches the public signals to prevent public signal tampering
      const calculatedCommitment = crypto
        .createHash('sha256')
        .update(`${proofUserId}:${proofScore}:${proofLimit}`)
        .digest('hex');

      if (commitment !== calculatedCommitment) {
        console.warn('ZK Credit Verification Failed: Commitment does not match public signals.');
        return false;
      }

      // Assert parameters committed in proof match what the backend expects
      if (proofUserId !== userId) {
        console.warn(`ZK Credit Verification Failed: User ID mismatch.`);
        return false;
      }

      if (Number(proofScore) !== expectedScore || Number(proofLimit) !== expectedLimit) {
        console.warn(`ZK Credit Verification Failed: Score/Limit parameters do not match public inputs.`);
        return false;
      }

      // Verify cryptographic signature
      const expectedSignature = crypto
        .createHmac('sha256', CRS_SECRET)
        .update(commitment)
        .digest('hex');

      const x_a = `0x${expectedSignature.substring(0, 16)}`;
      const y_a = `0x${expectedSignature.substring(16, 32)}`;
      const x_c = `0x${expectedSignature.substring(32, 48)}`;
      const y_c = `0x${expectedSignature.substring(48, 64)}`;

      if (proof.pi_a[0] !== x_a || proof.pi_a[1] !== y_a || proof.pi_c[0] !== x_c || proof.pi_c[1] !== y_c) {
        console.warn('ZK Credit Verification Failed: Proof signature failed (invalid zk-SNARK parameters).');
        return false;
      }

      return true;
    } catch (err) {
      console.error('ZK Credit Service Error:', err);
      return false;
    }
  }
}

export const zkService = new ZkService();
