export type ClientInput = {
  institutionName?: string;
  email?: string;
  password?: string;
  portalExpiryDate?: string | Date;
};

export const validateClientInput = (input: ClientInput) => {
  const missing = [];

  if (!input.institutionName?.trim()) missing.push("institutionName");
  if (!input.email?.trim()) missing.push("email");
  if (!input.password?.trim()) missing.push("password");
  if (!input.portalExpiryDate) missing.push("portalExpiryDate");

  if (missing.length > 0) {
    throw new Error("Institution name, email, password, portal expiry date are required !");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email as string)) {
    throw new Error("Please enter a valid email address");
  }
};
