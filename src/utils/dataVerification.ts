import { VerifyResponse } from 'src/models/connectedfields';

export const verifyEmail = (data: any) => {
  const errors: string[] = [];
  if (data.email) {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Invalid email format. Provide a valid email like user@domain.com.');
    }
  }

  return generateResult(errors, 'Email verification completed.');
};

export const verifyPhoneNumber = (data: any) => {
  const errors: string[] = [];
  if (data.countryCode) {
    const countryCodeRegex = /^(\+?\(?\d{1,6}\)?|\(\+\d{1,6}\)|\d{1,2}-?\d{3})$/;
    if (!countryCodeRegex.test(data.countryCode)) {
      errors.push('Invalid country code format.');
    }
  }

  if (data.phoneNumber) {
    const phoneNumberRegex = /^[0-9 ()-]+$/;
    if (!phoneNumberRegex.test(data.phoneNumber)) {
      errors.push('Invalid phone number format.');
    }
  }

  return generateResult(errors, 'Phone number verification completed.');
};

export const verifyPostalAddress = (data: any) => {
  const errors: string[] = [];

  if (data.street1) {
    if (data.street1.length > 100) {
      errors.push('Address Line 1 must be less than 100 characters.');
    }
  }

  if (data.street2) {
    if (data.street2.length > 100) {
      errors.push('Address Line 2 must be less than 100 characters.');
    }
  }

  if (data.locality) {
    if (!/^[a-zA-Z\s]+$/.test(data.locality)) {
      errors.push('City name must contain only letters.');
    }
  }

  if (data.subdivision) {
    if (!/^[a-zA-Z\s]+$/.test(data.subdivision)) {
      errors.push('State name must contain only letters.');
    }
  }

  if (data.countryOrRegion) {
    if (!/^[a-zA-Z\s]+$/.test(data.countryOrRegion)) {
      errors.push('Country/Region must contain only letters.');
    }
  }

  if (data.postalCode) {
    if (!/^[0-9]{5,10}$/.test(data.postalCode)) {
      errors.push('Postal code must contain 5-10 digits.');
    }
  }

  return generateResult(errors, 'Postal address verification completed.');
};

export const verifyBankAccount = (data: any) => {
  const errors: string[] = [];

  if (data.accountNumber) {
    if (!/^[0-9a-zA-Z]+$/.test(data.accountNumber)) {
      errors.push('Account number must be alphanumeric.');
    }
  }

  if (data.accountType) {
    const validAccountTypes = ['checking', 'savings'];
    if (!validAccountTypes.includes(data.accountType)) {
      errors.push('Account type must be either checking or savings.');
    }
  }

  if (data.routingNumber) {
    if (!/^\d{9}$/.test(data.routingNumber)) {
      errors.push('Routing number must be exactly 9 digits.');
    }
  }

  return generateResult(errors, 'Bank account verification completed.');
};

export const verifyBankAccountOwner = (data: any) => {
  const errors: string[] = [];

  if (data.accountNumber) {
    if (!/^[0-9a-zA-Z]+$/.test(data.accountNumber)) {
      errors.push('Account number must be alphanumeric.');
    }
  }

  if (data.accountType) {
    const validAccountTypes = ['checking', 'savings'];
    if (!validAccountTypes.includes(data.accountType)) {
      errors.push('Account type must be either checking or savings.');
    }
  }

  if (data.routingNumber) {
    if (!/^\d{9}$/.test(data.routingNumber)) {
      errors.push('Routing number must be exactly 9 digits.');
    }
  }

  if (data.firstName) {
    if (!/^[a-zA-Z]+$/.test(data.firstName)) {
      errors.push('First name must contain only letters.');
    }
  }

  if (data.lastName) {
    if (!/^[a-zA-Z]+$/.test(data.lastName)) {
      errors.push('Last name must contain only letters.');
    }
  }

  return generateResult(errors, 'Bank account owner verification completed.');
};

export const verifySSN = (data: any) => {
  const errors: string[] = [];

  if (data.socialSecurityNumber) {
    const ssnRegex = /^(?!(000|666|9))[0-9]{3}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}$/;
    if (!ssnRegex.test(data.socialSecurityNumber)) {
      errors.push('Invalid SSN format. Use the XXX-XX-XXXX format.');
    }
  }

  if (data.firstName) {
    if (!/^[a-zA-Z\s]+$/.test(data.firstName)) {
      errors.push('First name must contain only letters.');
    }
  }

  if (data.lastName) {
    if (!/^[a-zA-Z\s]+$/.test(data.lastName)) {
      errors.push('Last name must contain only letters.');
    }
  }

  if (data.dateOfBirth) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth)) {
      errors.push('Date of birth must follow the format yyyy-MM-dd.');
    }
  }

  return generateResult(errors, 'SSN verification completed.');
};

export const verifyBusinessEntity = (data: any) => {
  const errors: string[] = [];

  if (data.businessName) {
    if (data.businessName.length > 100) {
      errors.push('Business name must be less than 100 characters.');
    }
  }

  if (data.fein) {
    const feinRegex = /^\d{2}[-\s]?\d{7}$|^\d{9}$/;
    if (!feinRegex.test(data.fein)) {
      errors.push('Invalid FEIN format. Use XX-XXXXXXX or XXXXXXXXX.');
    }
  }

  return generateResult(errors, 'Business entity verification completed.');
};

const generateResult = (errors: string[], successMessage: string): VerifyResponse => {
  if (errors.length > 0) {
    return {
      verified: false,
      verifyResponseMessage: 'Verification failed.',
      verifyFailureReason: errors.join(' '),
      verificationResultCode: 'VALIDATION_ERRORS',
      suggestions: errors.map(error => ({ fix: error })),
    };
  }

  return {
    verified: true,
    verifyResponseMessage: successMessage,
    verificationResultCode: 'SUCCESS',
    verificationResultDescription: successMessage,
  };
};
