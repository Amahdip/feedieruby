"use client";

import { useTranslation } from "react-i18next";
import { HIDE_ENTERPRISE_UPSELL } from "@/lib/brand-color";
import { Button } from "@/modules/ui/components/button";
import { Dialog, DialogContent, DialogTitle } from "@/modules/ui/components/dialog";
import { ModalButton, UpgradePrompt } from "@/modules/ui/components/upgrade-prompt";

interface WorkspaceLimitModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  workspaceLimit: number;
  buttons: [ModalButton, ModalButton];
}

export const WorkspaceLimitModal = ({ open, setOpen, workspaceLimit, buttons }: WorkspaceLimitModalProps) => {
  const { t } = useTranslation();

  if (HIDE_ENTERPRISE_UPSELL) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {t("common.unlock_more_workspaces_with_a_higher_plan")}
          </DialogTitle>
          <p className="text-sm text-slate-500">
            {t("common.you_have_reached_your_limit_of_workspace_limit", { workspaceLimit })}
          </p>
          <Button className="mt-2" onClick={() => setOpen(false)}>
            {t("common.cancel")}
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle className="sr-only">{t("common.unlock_more_workspaces_with_a_higher_plan")}</DialogTitle>
        <UpgradePrompt
          title={t("common.unlock_more_workspaces_with_a_higher_plan")}
          description={t("common.you_have_reached_your_limit_of_workspace_limit", { workspaceLimit })}
          buttons={buttons}
          feature="workspaces"
        />
      </DialogContent>
    </Dialog>
  );
};
