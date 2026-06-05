export type Client = {
    id: number,
    _id?: string,
    institutionName: string,
    email: string,
    students: number,
    status: "active" | "expired",
    portalExpiryDate: string,
    institutionType?: string,
    logoUrl?: string,
    isActive?: boolean,
    source?: string
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