import { TreeItem, TreeItemCollapsibleState } from "vscode";


export class ActionsRootEntry extends TreeItem {

    public override contextValue = "actions";

    public constructor(label: string, id: string) {
        super(label, TreeItemCollapsibleState.Expanded);
        this.id = id;
    }
}
