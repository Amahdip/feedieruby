import { redirect } from "next/navigation";
import { IS_SALAMRUBY_CLOUD } from "@/lib/constants";
import { getBillingFallbackPath } from "@/lib/membership/navigation";
import { getWorkspaceAuth } from "@/modules/workspaces/lib/utils";

const ConfigLayout = async (props: {
  params: Promise<{ workspaceId: string }>;
  children: React.ReactNode;
}) => {
  const params = await props.params;

  const { children } = props;

  const { isBilling } = await getWorkspaceAuth(params.workspaceId);

  if (isBilling) {
    return redirect(getBillingFallbackPath(params.workspaceId, IS_SALAMRUBY_CLOUD));
  }

  return children;
};

export default ConfigLayout;
