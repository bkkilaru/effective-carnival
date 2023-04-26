import { api } from "@/utils/api";
import { useSession } from "next-auth/react";

export default function useUser() {
  const { status } = useSession();

  const { data: user, isLoading } = api.user.get.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  return {
    user,
    isLoading,
    status,
  };
}
