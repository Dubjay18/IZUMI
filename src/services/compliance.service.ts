export interface BvnVerificationResult {
  success: boolean;
  message: string;
  bvnDetails?: {
    bvn: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dob: string;
  };
}

export interface CacVerificationResult {
  success: boolean;
  message: string;
  cacDetails?: {
    rcNumber: string;
    companyName: string;
    registrationDate: string;
    status: 'ACTIVE' | 'INACTIVE';
    directors: string[];
  };
}

export interface TinVerificationResult {
  success: boolean;
  message: string;
  tinDetails?: {
    tin: string;
    taxpayerName: string;
    firsStatus: 'COMPLIANT' | 'NON_COMPLIANT';
  };
}

export class ComplianceService {
  /**
   * Simulate BVN identity lookup (SmileID/Mono)
   */
  async verifyBvn(bvn: string, fullName: string): Promise<BvnVerificationResult> {
    console.log(`ComplianceService: Starting BVN check for BVN: ***${bvn.slice(-4)}, Name: ${fullName}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (bvn.length !== 11 || !/^\d+$/.test(bvn)) {
      return {
        success: false,
        message: 'Invalid BVN format. BVN must be 11 numeric digits.',
      };
    }

    // Predefined mock test cases
    if (bvn.startsWith('999')) {
      return {
        success: false,
        message: 'BVN registry lookup failed. Record not found.',
      };
    }

    // Split name to match registry
    const names = fullName.toLowerCase().split(' ');
    const firstName = names[0] || 'amaka';
    const lastName = names[1] || 'okafor';

    return {
      success: true,
      message: 'BVN verified successfully',
      bvnDetails: {
        bvn,
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
        phoneNumber: '+2348012345678',
        dob: '1995-04-12',
      },
    };
  }

  /**
   * Simulate CAC registration registry check (Mono/Prembly)
   */
  async verifyCac(rcNumber: string, companyName: string, directorName: string): Promise<CacVerificationResult> {
    console.log(`ComplianceService: Starting CAC check for RC: ${rcNumber}, Company: ${companyName.substring(0, 8)}***`);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!rcNumber.startsWith('RC') && !rcNumber.startsWith('BN')) {
      return {
        success: false,
        message: 'Invalid registration number prefix. Must start with RC or BN.',
      };
    }

    if (rcNumber.includes('999')) {
      return {
        success: false,
        message: 'CAC registration check failed. RC Number is inactive or does not exist.',
      };
    }

    return {
      success: true,
      message: 'CAC Company verified successfully',
      cacDetails: {
        rcNumber,
        companyName,
        registrationDate: '2022-08-15',
        status: 'ACTIVE',
        directors: [directorName, 'John Doe'], // Ensure the onboarding director is in the list
      },
    };
  }

  /**
   * Simulate TIN tax validation check (Prembly)
   */
  async verifyTin(tin: string): Promise<TinVerificationResult> {
    console.log(`ComplianceService: Starting TIN check for: ***${tin.slice(-4)}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    if (tin.length < 8) {
      return {
        success: false,
        message: 'TIN format invalid. Must be at least 8 characters.',
      };
    }

    if (tin.startsWith('999')) {
      return {
        success: false,
        message: 'TIN verification failed. Non-compliant with tax authority.',
      };
    }

    return {
      success: true,
      message: 'TIN verified successfully',
      tinDetails: {
        tin,
        taxpayerName: 'Corporate Taxpayer',
        firsStatus: 'COMPLIANT',
      },
    };
  }
}

export const complianceService = new ComplianceService();
