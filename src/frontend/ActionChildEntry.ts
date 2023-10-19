import * as path from "path";
import { TreeItem, TreeItemCollapsibleState, Command } from "vscode";
import { ILexicalRange, CodeActionType } from "../types.js";
import { IRangeHolder } from "./FrontendUtils.js";
import { ActionsRootEntry } from "./ActionsRootEntry.js";

export class ActionChildEntry extends TreeItem implements IRangeHolder {

    private static imageBaseNames: Map<CodeActionType, string> = new Map([
        [CodeActionType.GlobalNamed, "named-action"],
        [CodeActionType.LocalNamed, "named-action"],
        [CodeActionType.ParserAction, "parser-action"],
        [CodeActionType.LexerAction, "parser-action"],
        [CodeActionType.ParserPredicate, "predicate"],
        [CodeActionType.LexerPredicate, "predicate"],
    ]);

    public override contextValue = "action";

    public constructor(
        public readonly parent: ActionsRootEntry,
        label: string,
        type: CodeActionType,
        public readonly range?: ILexicalRange,
        command?: Command) {

        super(label, TreeItemCollapsibleState.None);
        this.command = command;

        const baseName = ActionChildEntry.imageBaseNames.get(type);
        if (baseName) {
            this.contextValue = baseName;
            this.iconPath = {
                light: path.join(__dirname, "..", "misc", baseName + "-light.svg"),
                dark: path.join(__dirname, "..", "misc", baseName + "-dark.svg"),
            };
        }
    }
}
