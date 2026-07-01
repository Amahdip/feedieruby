import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getOnboardingWorkspace } from "@/app/(app)/(onboarding)/lib/onboarding-workspace";
import { getOnboardingRedirectPath } from "@/app/(app)/(onboarding)/lib/redirect-if-onboarding-complete";
import ClientWorkspaceRedirect from "@/app/ClientWorkspaceRedirect";
import { getMembershipByUserIdOrganizationId } from "@/lib/membership/service";
import { getAccessFlags } from "@/lib/membership/utils";
import { getOrganizationsByUserId } from "@/lib/organization/service";
import { getUser } from "@/lib/user/service";
import { getUserWorkspaces } from "@/lib/workspace/service";
import { authOptions } from "@/modules/auth/lib/authOptions";
import { ClientLogout } from "@/modules/ui/components/client-logout";

/**
 * Authenticated entry resolver. The public "/" landing is now statically
 * rendered (so it's cacheable + crawlable); logged-in users are sent here
 * (client-side, see RedirectAuthedHome) to resolve their organization/workspace.
 * This holds the exact routing logic that used to live in app/page.tsx.
 */
const ContinuePage = async () => {
  const session: Session | null = await getServerSession(authOptions);

  if (!session) {
    return redirect("/auth/login");
  }

  const user = await getUser(session.user.id);
  if (!user) {
    return <ClientLogout />;
  }

  const userOrganizations = await getOrganizationsByUserId(session.user.id);

  if (userOrganizations.length === 0) {
    return redirect("/setup/organization/create");
  }

  // Collect workspace IDs across all organizations
  const allWorkspaceIds: string[] = [];
  for (const org of userOrganizations) {
    const workspaces = await getUserWorkspaces(user.id, org.id);
    for (const ws of workspaces) {
      allWorkspaceIds.push(ws.id);
    }
  }

  const currentUserMembership = await getMembershipByUserIdOrganizationId(
    session.user.id,
    userOrganizations[0].id
  );

  const { isManager, isOwner } = getAccessFlags(currentUserMembership?.role);

  if (allWorkspaceIds.length === 0 && !isOwner && !isManager) {
    return redirect(`/organizations/${userOrganizations[0].id}/landing`);
  }

  if (isOwner || isManager) {
    const onboardingWorkspace = await getOnboardingWorkspace(session.user.id, userOrganizations[0].id);
    const onboardingRedirectPath = await getOnboardingRedirectPath({
      organizationId: userOrganizations[0].id,
      workspace: onboardingWorkspace,
    });

    if (onboardingRedirectPath) {
      return redirect(onboardingRedirectPath);
    }
  }

  return <ClientWorkspaceRedirect userWorkspaceIds={allWorkspaceIds} />;
};

export default ContinuePage;
