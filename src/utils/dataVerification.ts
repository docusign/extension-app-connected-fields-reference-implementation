import { VerifyResponse } from '../models/connectedfields';

export const verifyAddress = (data: any) => {
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

  return generateResult(errors, 'Postal address verification completed.');
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

export const verifyEmailAddress = (data: any) => {
  const errors: string[] = [];

  if (data.email) {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Invalid email format. Provide a valid email like user@domain.com.');
    }
  }

  return generateResult(errors, 'Email verification completed.');
};

export const verifyBusinessDetails = (data: any) => {
  const errors: string[] = [];

  const addressResult = verifyAddress(data.businessAddress);
  const emailResult = verifyEmailAddress(data.businessEmail);
  const phoneResult = verifyPhoneNumber(data.businessPhone);

  const isValidName = data.businessName?.startsWith('A') && data.businessName?.length >= 3;
  const isValidAbn = /^[0-9]{11}$/.test(data.businessABN || '');
  const isValidAddress = addressResult.verified && data.businessAddress?.countryOrRegion?.toLowerCase()?.startsWith('au');
  const isValidAccountName = data.billingAccountName?.startsWith('B') && data.billingAccountName?.length >= 3;
  const isValidBillingAccountBSB = /^[0-9]{6}$/.test(data.billingAccountBSB || '');
  const isValidAccountNumber = /^[0-9]{9}$/.test(data.billingAccountNumber || '');
  const isValidEmail = emailResult.verified;
  const isValidPhone = phoneResult.verified;

  const isError =
    !isValidName ||
    !isValidAbn ||
    !isValidAddress ||
    !isValidAccountName ||
    !isValidBillingAccountBSB ||
    !isValidAccountNumber ||
    !isValidEmail ||
    !isValidPhone;

  if (!isValidAddress) {
    errors.push(addressResult.verifyFailureReason || 'Failed to verify business address.');
  } else if (!isValidEmail) {
    errors.push(emailResult.verifyFailureReason || 'Failed to verify business email.');
  } else if (!isValidPhone) {
    errors.push(phoneResult.verifyFailureReason || 'Failed to verify business phone number.');
  } else if (isError) {
    errors.push('We could not verify your Business Details. Please review your entry.');
  }

  const suggestions: object[] = [];
  if (!isError) {
    data.businessAddress.street1 = 'Level 6, Quay West Building, 111 Harrington Street';
    data.businessAddress.locality = 'Sydney';
    data.businessAddress.subdivision = 'NSW';
    data.businessAddress.countryOrRegion = 'Australia';
    data.businessAddress.postalCode = '2000';
    suggestions.push(data);
  }

  return generateResult(errors, 'Business Details verified.', suggestions);
};

export const verifyAdministrator = (data: any) => {
  const errors: string[] = [];

  const emailResult = verifyEmailAddress(data.email);
  const phoneResult = verifyPhoneNumber(data.phone);

  const isError = data.firstName !== 'Dominique' || data.lastName !== 'Iam' || !emailResult.verified || !phoneResult.verified;

  if (!emailResult.verified) {
    errors.push(emailResult.verifyFailureReason || 'Failed to verify administrator email.');
  } else if (!phoneResult.verified) {
    errors.push(phoneResult.verifyFailureReason || 'Failed to verify administrator phone number.');
  } else if (isError) {
    errors.push('We could not verify your Administor(s) registration information. Please review your entry.');
  }

  return generateResult(errors, 'Administor(s) registration verified.');
};

export const verifyCompanyDirector = (data: any) => {
  const errors: string[] = [];

  const isError =
    data.name !== 'Daniel Director' || data.position !== 'CEO' || data.customerNumber !== '123456' || !/^036\d{11}\d$/.test(data.directorId);

  if (isError) {
    errors.push('We could not verify your Business Network Owner information. Please review your entry.');
  }

  return generateResult(errors, 'Business Network Owner verified.');
};

const generateResult = (errors: string[], successMessage: string, suggestions?: object[]): VerifyResponse => {
  if (errors.length > 0) {
    return {
      verified: false,
      verifyResponseMessage: 'Verification failed.',
      verifyFailureReason: errors.join(' '),
      verificationResultCode: 'VALIDATION_ERRORS',
      suggestions,
    };
  }

  return {
    verified: true,
    verifyResponseMessage: successMessage,
    verificationResultCode: 'SUCCESS',
    verificationResultDescription: successMessage,
    suggestions,
  };
};
