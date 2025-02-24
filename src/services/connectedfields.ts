import { IReq, IRes } from '../utils/types';
import { ConceptDeclaration, ModelManager } from '@accordproject/concerto-core';
import path from 'path';
import { ModelManagerUtil } from '../utils/modelManagerUtil';
import { GetTypeDefinitionsBody, GetTypeNamesBody, TypeNameInfo, VerifyBody } from '../models/connectedfields';
import {
  verifyEmail,
  verifyPhoneNumber,
  verifyPostalAddress,
  verifyBankAccount,
  verifyBankAccountOwner,
  verifySSN,
  verifyBusinessEntity,
  verifyVehicleIdentification,
} from '../utils/dataVerification';
import VehicleDatabase from '../db/vehicleDatabase';

enum DECORATOR_NAMES {
  TERM = 'Term',
}
enum ErrorCode {
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
}

type ErrorResponse = {
  message: string;
  code: string;
};

/**
 * Generates an error response object with the provided message and code.
 *
 * @param {string} message - The error message.
 * @param {string} code - The error code.
 * @return {ErrorResponse} The generated error response object.
 */
const generateErrorResponse = (message: string, code: string): ErrorResponse => {
  return {
    message,
    code,
  };
};

/**
 * Concerto model manager setup using CTO file.
 * Model manager allowes users to load in CTO files and use Concerto model features directly in code.
 */
const MODEL_MANAGER: ModelManager = ModelManagerUtil.createModelManagerFromCTO(path.join(__dirname, '../dataModel/model.cto'));
const MODEL_FILE = MODEL_MANAGER.getModelFile('org.example@1.0.0');
const CONCEPTS: ConceptDeclaration[] = MODEL_MANAGER.getConceptDeclarations();
const DECLARATIONS = MODEL_FILE.getAllDeclarations().map(decl => decl.ast);

/**
 * Database for vehicles.
 * This is just reading from a CSV file
 */
const VEHICLE_DB = new VehicleDatabase(path.join(__dirname, '../db/vehicleDatabase.csv'));

/**
 * Retrieves the type names for Account and MasterRecordId and Address.
 * @param {IReq<GetTypeNamesBody>} req - the request object
 * @param {IRes} res - the response object
 * @return {IRes}
 */
export const getTypeNames = (req: IReq<GetTypeNamesBody>, res: IRes): IRes => {
  const typeNameInfos: TypeNameInfo[] = CONCEPTS.map((concept: ConceptDeclaration) => {
    return {
      typeName: concept.getName(),
      label: concept.getDecorator(DECORATOR_NAMES.TERM).getArguments()[0] as unknown as string,
    };
  });

  return res.json({ typeNames: typeNameInfos as TypeNameInfo[] });
};

/**
 * Retrieves the type definitions for the given type names.
 * @param {IReq<GetTypeDefinitionsBody>} req - The request object.
 * @param {IRes} res - The response object.
 * @return {IRes}
 */
export const getTypeDefinitions = (req: IReq<GetTypeDefinitionsBody>, res: IRes): IRes => {
  const {
    body: { typeNames },
  } = req;
  if (!typeNames) {
    return res.status(400).json(generateErrorResponse(ErrorCode.BAD_REQUEST, 'Missing typeNames in request')).send();
  }
  MODEL_MANAGER.addCTOModel;
  try {
    return res.json({
      declarations: DECLARATIONS
    });
  } catch (err) {
    console.log(`Encountered an error getting type definitions: ${err.message}`);
    return res.status(500).json(generateErrorResponse(ErrorCode.INTERNAL_ERROR, err)).send();
  }
};

/**
 * Performs data verification on the given type.
 * @param {IReq<GetTypeDefinitionsBody>} req - The request object.
 * @param {IRes} res - The response object.
 * @return {IRes}
 */
export const verify = (req: IReq<VerifyBody>, res: IRes): IRes => {
  const {
    body: { typeName, idempotencyKey, data },
  } = req;
  if (!typeName) {
    return res.status(400).json(generateErrorResponse(ErrorCode.BAD_REQUEST, 'Missing typeName in request')).send();
  }
  if (!data) {
    return res.status(400).json(generateErrorResponse(ErrorCode.BAD_REQUEST, 'Missing data in request')).send();
  }
  try {
    switch (typeName) {
      case 'VerifyEmailInput':
        return res.status(200).json(verifyEmail(data)).send();
      case 'VerifyPhoneNumberInput':
        return res.status(200).json(verifyPhoneNumber(data)).send();
      case 'PostalAddress':
        return res.status(200).json(verifyPostalAddress(data)).send();
      case 'VerifyBankAccountInput':
        return res.status(200).json(verifyBankAccount(data)).send();
      case 'VerifyBankAccountOwnerInput':
        return res.status(200).json(verifyBankAccountOwner(data)).send();
      case 'VerifySocialSecurityNumberInput':
        return res.status(200).json(verifySSN(data)).send();
      case 'VerifyBusinessEntityInput':
        return res.status(200).json(verifyBusinessEntity(data)).send();
      case 'VehicleIdentification':
        return res.status(200).json(verifyVehicleIdentification(data, VEHICLE_DB)).send();
      default:
        return res
          .status(400)
          .json(generateErrorResponse(ErrorCode.BAD_REQUEST, `Type: [${typeName}] is not verifiable`))
          .send();
    }
  } catch (err) {
    console.log(`Encountered an error verifying type: ${err.message}`);
    return res.status(500).json(generateErrorResponse(ErrorCode.INTERNAL_ERROR, err)).send();
  }
};
