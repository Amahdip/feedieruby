import { Workspace } from "@salamruby/database/prisma";

export interface TUserWorkspace extends Pick<Workspace, "id" | "name"> {}
