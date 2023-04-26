import getBaseUrl from "@/utils/getBaseUrl";

const getTeamInviteUrl = ({ code, email }: { code: string; email: string }) => {
  return `${getBaseUrl()}/auth/accept-invite?code=${encodeURIComponent(
    code
  )}&email=${encodeURIComponent(email)}`;
};

export default getTeamInviteUrl;
