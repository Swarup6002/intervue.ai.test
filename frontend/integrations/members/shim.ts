// Minimal members shim to replace @wix/members API surface used in the app

export namespace members {
  export type MemberProfilePhoto = { url?: string; height?: number; width?: number; offsetX?: number; offsetY?: number };
  export type MemberProfile = { nickname?: string; photo?: MemberProfilePhoto; title?: string };
  export type MemberContact = { firstName?: string; lastName?: string; phones?: string[] };
  export type MemberCore = {
    loginEmail?: string;
    loginEmailVerified?: boolean;
    status?: 'UNKNOWN' | 'PENDING' | 'APPROVED' | 'BLOCKED' | 'OFFLINE';
    contact?: MemberContact;
    profile?: MemberProfile;
    _createdDate?: string;
    _updatedDate?: string;
    lastLoginDate?: string;
    member?: any;
  };
  export type GetMyMemberResponse = { member: MemberCore | null };
}

export const members = {
  async getCurrentMember(_opts?: any): Promise<members.GetMyMemberResponse | null> {
    // Minimal shim: return null member by default
    return { member: null };
  },
};
