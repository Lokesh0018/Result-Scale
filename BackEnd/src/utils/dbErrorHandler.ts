import { Model } from "mongoose";

/**
 * Validates a MongoDB/Mongoose duplicate key error (code 11000).
 * Verifies if the record actually exists in the database before treating it as a duplicate error.
 * Logs which field and value triggered the duplicate index.
 *
 * @param err The error caught in the try-catch block.
 * @param model The Mongoose model associated with the operation.
 * @param docData The data object that was attempted to be inserted or updated.
 * @returns An object containing `isDuplicate` (boolean) and `message` (clean message).
 */
export const checkAndLogDuplicate = async (
  err: any,
  model: Model<any>,
  docData: any
): Promise<{ isDuplicate: boolean; message: string }> => {
  const isDuplicateError = err.code === 11000 || 
                           err.message?.includes("Already Exists") ||
                           err.message?.toLowerCase().includes("duplicate") ||
                           err.message?.toLowerCase().includes("unique index");

  if (!isDuplicateError) {
    return { isDuplicate: false, message: err.message || "An unexpected error occurred." };
  }

  // Determine the collection/model name
  const modelName = model.modelName;

  // 1. Parse and log the duplicate index details
  let duplicateField = "";
  let duplicateValue = "";

  if (err.keyValue) {
    const keys = Object.keys(err.keyValue);
    if (keys.length > 0) {
      duplicateField = keys[0];
      duplicateValue = err.keyValue[duplicateField];
    }
  } else if (err.message) {
    // Attempt parsing index name from error message (e.g. index: email_1 dup key)
    const indexMatch = err.message.match(/index:\s+(\w+)_/);
    if (indexMatch && indexMatch[1]) {
      duplicateField = indexMatch[1];
      if (docData && docData[duplicateField] !== undefined) {
        duplicateValue = docData[duplicateField];
      }
    }
  }

  // Fallback to standard fields if we couldn't parse
  if (!duplicateField) {
    if (modelName === "Student" && docData.rollNo) {
      duplicateField = "rollNo";
      duplicateValue = docData.rollNo;
    } else {
      duplicateField = "email";
      duplicateValue = docData.email || "";
    }
  }

  // Log to identify the duplicate constraint
  console.error(`[DATABASE UNIQUE CONSTRAINT TRIGGERED]
    Model: ${modelName}
    Field: ${duplicateField}
    Value: ${duplicateValue}
    Error Code: ${err.code}
    Error Message: ${err.message}
  `);

  // 2. Verify whether the record actually exists before triggering validation
  const query: Record<string, any> = {};
  if (duplicateField === "rollNo" && docData.clientId) {
    query.rollNo = duplicateValue;
    query.clientId = docData.clientId;
  } else {
    query[duplicateField] = typeof duplicateValue === "string" ? duplicateValue.toLowerCase() : duplicateValue;
  }

  const existingRecord = await model.findOne(query).lean();

  if (existingRecord) {
    // If it's an update operation, check if the existing record is the same document
    if (docData._id && existingRecord._id.toString() === docData._id.toString()) {
      console.warn(`[False Duplicate] Unique index error triggered during self-update for ID: ${docData._id}`);
      return { isDuplicate: false, message: "Unique index triggered on self-update" };
    }

    const cleanFieldName = duplicateField === "email" ? "Email" : duplicateField === "rollNo" ? "Roll Number" : duplicateField;
    return {
      isDuplicate: true,
      message: `Already Exists with ${cleanFieldName} ${duplicateValue}`
    };
  }

  // If the record does not actually exist in the DB, it's a false duplicate error
  console.warn(`[False Duplicate] DB threw unique error but no record exists with query: ${JSON.stringify(query)}`);
  return {
    isDuplicate: false,
    message: err.message || "Database index validation failed, but data does not exist."
  };
};
