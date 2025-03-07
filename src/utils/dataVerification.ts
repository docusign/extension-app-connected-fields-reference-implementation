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

  if (data.postalCode) {
    if (!/^[0-9]{5,10}$/.test(data.postalCode)) {
      errors.push('Postal code must contain 5-10 digits.');
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

export const verifyOwnerInformation = (data: any) => {
  const errors: string[] = [];

  const addressResult = verifyAddress(data.address);
  const phoneResult = verifyPhoneNumber(data.phone || {});
  const emailResult = verifyEmailAddress(data.email || {});

  const isError =
    data.firstName !== 'Jane' ||
    data.lastName !== 'Iam' ||
    data.dateOfBirth !== '01-01-1970' ||
    data.socialSecurityNumber !== '123-45-6789' ||
    !addressResult.verified ||
    !phoneResult.verified ||
    !emailResult.verified;

  if (!addressResult.verified) {
    errors.push(addressResult.verifyFailureReason || 'Address verification failed.');
  } else if (!phoneResult.verified) {
    errors.push(phoneResult.verifyFailureReason || 'Phone number verification failed.');
  } else if (!emailResult.verified) {
    errors.push(emailResult.verifyFailureReason || 'Email verification failed.');
  } else if (isError) {
    errors.push('We could not verify your Owner Information. Please review your entry.');
  }

  let suggestions: object[] = [];
  if (!isError) {
    // Mock logic to autofill on success
    let autofilled = Boolean(data.phone) || Boolean(data.email);
    if (data.phone) {
      data.phone.countryCode = '1';
      data.phone.phoneNumber = '212-596-1628';
    }
    if (data.email) {
      data.email.email = 'jane@customer.com';
    }

    if (autofilled) {
      suggestions.push(data);
    }
  }

  return generateResult(errors, 'Owner Information verified.', suggestions);
};

export const verifySpouseInformation = (data: any) => {
  const errors: string[] = [];
  const isError =
    data.firstName !== 'Dominique' || data.lastName !== 'Iam' || data.dateOfBirth !== '07-02-1990' || data.socialSecurityNumber !== '321-45-1234';

  if (isError) {
    errors.push('We could not verify your Spouse Information. Please review your entry.');
  }

  return generateResult(errors, 'Spouse Information verified.');
};

export const verifyFundPlan = (data: any) => {
  const errors: string[] = [];
  const isError = data.fundName !== 'Example Fund II' || data.planId !== '12345-SC';

  if (isError) {
    errors.push('We could not verify your Fund Plan information. Please review your entry.');
  }

  return generateResult(errors, 'Fund Plan verified.');
};

export const verifyBeneficiaryInformation = (data: any) => {
  const errors: string[] = [];

  const addressResult = verifyAddress(data.residentialAddress);

  const isError =
    data.name !== 'Lin Iam' || data.originalOwner !== 'Joan Iam' || data.originalOwnerDateOfBirth !== '10-04-2000' || !addressResult.verified;

  if (!addressResult.verified) {
    errors.push(addressResult.verifyFailureReason || 'Address verification failed');
  } else if (isError) {
    errors.push('We could not verify your Beneficiary Name information. Please review your entry.');
  }

  return generateResult(errors, 'Beneficiary Information verified.');
};

export const verifyTrustedContactInformation = (data: any) => {
  const errors: string[] = [];

  const addressResult = verifyAddress(data.address || {});
  const phoneResult = verifyPhoneNumber(data.phone);
  const emailResult = verifyEmailAddress(data.email);

  const isError =
    data.firstName !== 'Dana' ||
    data.lastName !== 'Wrong' ||
    data.relationship !== 'Friend' ||
    !emailResult.verified ||
    !phoneResult.verified ||
    !addressResult.verified;

  if (!addressResult.verified) {
    errors.push(addressResult.verifyFailureReason || 'Address verification failed.');
  } else if (!phoneResult.verified) {
    errors.push(phoneResult.verifyFailureReason || 'Phone number verification failed.');
  } else if (!emailResult.verified) {
    errors.push(emailResult.verifyFailureReason || 'Email verification failed.');
  } else if (isError) {
    errors.push(`The Trusted Contact doesn't match our records for this account.`);
  }

  return generateResult(errors, 'Success! Trusted Contact verified.');
};

export const verifyTRowePriceAccount = (data: any) => {
  const errors: string[] = [];
  const isError = data.accountNumber !== '10987654321' || data.fundName !== 'Example Fund III';

  if (isError) {
    errors.push('We could not verify your Tally US Account. Please review your entry.');
  }

  return generateResult(errors, 'Success! Tally US Account verified.');
};

export const verifyPayeeInformation = (data: any) => {
  const errors: string[] = [];
  const isError = data.payeeName !== 'Example Payee' || data.accountNumber !== '12345678' || data.accountOrPlanType !== 'Example Plan Type';

  if (isError) {
    errors.push('We could not verify your Account Number. Please review your entry.');
  }

  return generateResult(errors, 'Payee account verified.');
};

export const verifyW4RPersonInformation = (data: any) => {
  const errors: string[] = [];
  const isError =
    data.firstName !== 'Jane' || data.lastName !== 'Iam' || data.socialSecurityNumber !== '123-45-6789' || data.dateOfBirth !== '01-01-1970';

  if (isError) {
    errors.push('IRS Person Information failed verification. Please review your entry.');
  }

  return generateResult(errors, 'IRS Person Information verified.');
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
