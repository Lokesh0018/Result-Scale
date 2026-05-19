export type Client = {
    id: number,
    institutionName: string,
    email: string,
    students: number,
    status: "active" | "expired",
    portalExpiryDate: string
}

export type Student = {
    _id: string,
    clientId: string,
    name: string,
    email: string,
    rollNo: string,
    institutionName: string,
    semester: number,
    sgpa: number,
    __v: number,
    otp: string,
    otpExpiry: string
}