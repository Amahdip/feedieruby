"use client";

import { OrganizationBreadcrumb } from "@/app/(app)/workspaces/[workspaceId]/components/organization-breadcrumb";
import { WorkspaceBreadcrumb } from "@/app/(app)/workspaces/[workspaceId]/components/workspace-breadcrumb";
import { Breadcrumb, BreadcrumbList } from "@/modules/ui/components/breadcrumb";

interface WorkspaceAndOrgSwitchProps {
  currentOrganizationId: string;
  currentOrganizationName?: string; // Optional: for pages without context
  currentWorkspaceId?: string;
  currentWorkspaceName?: string; // Optional: for pages without context
  isMultiOrgEnabled: boolean;
  organizationWorkspacesLimit: number;
  isSalamRubyCloud: boolean;
  isLicenseActive: boolean;
  isOwnerOrManager: boolean;
  isAccessControlAllowed: boolean;
  isMembershipPending: boolean;
}

export const WorkspaceAndOrgSwitch = ({
  currentOrganizationId,
  currentOrganizationName,
  currentWorkspaceId,
  currentWorkspaceName,
  isMultiOrgEnabled,
  organizationWorkspacesLimit,
  isSalamRubyCloud,
  isLicenseActive,
  isOwnerOrManager,
  isAccessControlAllowed,
  isMembershipPending,
}: WorkspaceAndOrgSwitchProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-0">
        <OrganizationBreadcrumb
          currentOrganizationId={currentOrganizationId}
          currentOrganizationName={currentOrganizationName}
          currentWorkspaceId={currentWorkspaceId}
          isMultiOrgEnabled={isMultiOrgEnabled}
        />
        {currentWorkspaceId && (
          <WorkspaceBreadcrumb
            currentWorkspaceId={currentWorkspaceId}
            currentWorkspaceName={currentWorkspaceName}
            currentOrganizationId={currentOrganizationId}
            isOwnerOrManager={isOwnerOrManager}
            organizationWorkspacesLimit={organizationWorkspacesLimit}
            isSalamRubyCloud={isSalamRubyCloud}
            isLicenseActive={isLicenseActive}
            isAccessControlAllowed={isAccessControlAllowed}
            isEnvironmentBreadcrumbVisible={false}
            isMembershipPending={isMembershipPending}
          />
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
