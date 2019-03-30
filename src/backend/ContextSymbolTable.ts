/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict";

import { ParserRuleContext } from 'antlr4ts';
import { SymbolTable, Symbol, ScopedSymbol, SymbolTableOptions } from "antlr4-c3";

import { SymbolKind, SymbolGroupKind, SymbolInfo } from '../backend/facade';
import { SourceContext } from './SourceContext';
import { ParseTree, TerminalNode } from 'antlr4ts/tree';

const _ = require('lodash');

type SymbolStore = Map<SymbolKind, Map<string, ParserRuleContext | undefined>>;

export class ContextSymbolTable extends SymbolTable {
    public tree: ParserRuleContext; // Set by the owning source context after each parse run.

    constructor(name: string, options: SymbolTableOptions, public owner?: SourceContext) {
        super(name, options);
    };

    public clear() {
        // Before clearing the dependencies make sure the owners are updated.
        if (this.owner) {
            for (let dep of this.dependencies) {
                if ((dep as ContextSymbolTable).owner) {
                    this.owner.removeDependency((dep as ContextSymbolTable).owner!);
                }
            }
        }
        this.symbolReferences.clear();
        super.clear();
    }

    public symbolExists(name: string, kind: SymbolKind, localOnly: boolean): boolean {
        return this.getSymbolOfType(name, kind, localOnly) != undefined;
    }

    public symbolExistsInGroup(symbol: string, kind: SymbolGroupKind, localOnly: boolean): boolean {
        // Group of lookups.
        switch (kind) {
            case SymbolGroupKind.TokenRef:
                if (this.symbolExists(symbol, SymbolKind.BuiltInLexerToken, localOnly))
                    return true;
                if (this.symbolExists(symbol, SymbolKind.VirtualLexerToken, localOnly))
                    return true;
                if (this.symbolExists(symbol, SymbolKind.FragmentLexerToken, localOnly))
                    return true;
                if (this.symbolExists(symbol, SymbolKind.LexerToken, localOnly))
                    return true;
                break;

            case SymbolGroupKind.LexerMode:
                if (this.symbolExists(symbol, SymbolKind.BuiltInMode, localOnly))
                    return true;
                if (this.symbolExists(symbol, SymbolKind.LexerMode, localOnly))
                    return true;
                break;

            case SymbolGroupKind.TokenChannel:
                if (this.symbolExists(symbol, SymbolKind.BuiltInChannel, localOnly))
                    return true;
                if (this.symbolExists(symbol, SymbolKind.TokenChannel, localOnly))
                    return true;
                break;

            case SymbolGroupKind.RuleRef:
                if (this.symbolExists(symbol, SymbolKind.ParserRule, localOnly))
                    return true;
                break;
        }
        return false;
    }

    public contextForSymbol(symbolName: string, kind: SymbolKind, localOnly: boolean): ParseTree | undefined {
        let symbol = this.getSymbolOfType(symbolName, kind, localOnly);
        if (!symbol) {
            return undefined;
        }
        return symbol.context;
    }

    public getSymbolInfo(symbol: string | Symbol): SymbolInfo | undefined {
        if (!(symbol instanceof Symbol)) {
            let temp = this.resolve(symbol);
            if (!temp) {
                return undefined;
            }
            symbol = temp;
        }

        let kind = SourceContext.getKindFromSymbol(symbol);
        let name = (symbol as Symbol).name;

        // Special handling for imports.
        if (kind == SymbolKind.TokenVocab || kind == SymbolKind.Import) {
            // Get the source id from a dependent module.
            this.dependencies.forEach((table: ContextSymbolTable) => {
                if (table.owner && table.owner.sourceId.includes(name)) {
                    return { // TODO: implement a best match search.
                        kind: kind,
                        name: name,
                        source: table.owner.fileName,
                        definition: SourceContext.definitionForContext(table.tree, true)
                    };
                }
            });
        }

        let symbolTable = symbol.symbolTable as ContextSymbolTable;
        return {
            kind: kind,
            name: name,
            source: (symbol.context && symbolTable && symbolTable.owner) ? symbolTable.owner.fileName : "ANTLR runtime",
            definition: SourceContext.definitionForContext(symbol.context, true),
            description: undefined
        };

    }

    private symbolsOfType<T extends Symbol>(t: new (...args: any[]) => T, localOnly: boolean = false): SymbolInfo[] {
        var result: SymbolInfo[] = [];

        let symbols = this.getAllSymbols(t, localOnly);
        for (let symbol of symbols) {
            let root = symbol.root as ContextSymbolTable;
            result.push({
                kind: SourceContext.getKindFromSymbol(symbol),
                name: symbol.name,
                source: root.owner ? root.owner.fileName : "ANTLR runtime",
                definition: SourceContext.definitionForContext(symbol.context, true),
                description: undefined
            });
        }
        return result;
    }

    public listTopLevelSymbols(localOnly: boolean): SymbolInfo[] {
        let result: SymbolInfo[] = [];

        let options = this.resolve("options", true);
        if (options) {
            let tokenVocab = options.resolve("tokenVocab", true);
            if (tokenVocab) {
                result.push(this.getSymbolInfo(tokenVocab)!);
            }
        }
        result.push(...this.symbolsOfType(ImportSymbol, localOnly));
        result.push(...this.symbolsOfType(BuiltInTokenSymbol, localOnly));
        result.push(...this.symbolsOfType(VirtualTokenSymbol, localOnly));
        result.push(...this.symbolsOfType(FragmentTokenSymbol, localOnly));
        result.push(...this.symbolsOfType(TokenSymbol, localOnly));
        result.push(...this.symbolsOfType(BuiltInModeSymbol, localOnly));
        result.push(...this.symbolsOfType(LexerModeSymbol, localOnly));
        result.push(...this.symbolsOfType(BuiltInChannelSymbol, localOnly));
        result.push(...this.symbolsOfType(TokenChannelSymbol, localOnly));
        result.push(...this.symbolsOfType(RuleSymbol, localOnly));

        return result;
    }

    public listActions(): SymbolInfo[] {
        let result: SymbolInfo[] = [];
        let actions = this.getNestedSymbolsOfType(ActionSymbol);
        for (let action of actions) {
            let definition = SourceContext.definitionForContext(action.context, true);
            if (action.isPredicate) {
                // Extend the range to the following QUESTION token, if this action is actually a predicate.
                let questionMark = action.nextSibling;
                if (questionMark) {
                    let context = questionMark.context as TerminalNode;
                    definition!.range.end.row = context.symbol.line;
                    definition!.range.end.column = context.symbol.charPositionInLine;
                }
            }

            result.push({
                kind: SourceContext.getKindFromSymbol(action),
                name: action.name,
                source: this.owner ? this.owner.fileName : "",
                definition: definition,
                isPredicate: action.isPredicate,
                description: action.context!.text
            });
        }

        return result;
    }

    public getReferenceCount(symbolName: string): number {
        let reference = this.symbolReferences.get(symbolName);
        if (reference) {
            return reference;
        } else {
            return 0;
        }
    }

    public getUnreferencedSymbols(): string[] {
        let result: string[] = [];
        for (let entry of this.symbolReferences) {
            if (entry[1] == 0) {
                result.push(entry[0]);
            }
        }
        return result;
    }

    public incrementSymbolRefCount(symbolName: string) {
        let reference = this.symbolReferences.get(symbolName);
        if (reference) {
            this.symbolReferences.set(symbolName, reference + 1);
        } else {
            this.symbolReferences.set(symbolName, 1);
        }
    }

    private symbolIsRule(symbol: Symbol): boolean {
        return symbol instanceof RuleSymbol || symbol instanceof TokenSymbol
            || symbol instanceof FragmentTokenSymbol || symbol instanceof VirtualTokenSymbol;
    }

    private findNestedOccurencesFor(name: string, resolveSymbolPaths: boolean): SymbolInfo[] {
        let result: SymbolInfo[] = [];
        let pending: SymbolInfo[] = [];

        let references: Symbol[] = this.getAllNestedSymbols(name);

        // Each reference path contains at least 2 entries: the containing symbol table and a rule
        // (either the symbol itself or a containing rule).
        let parentSymbols: Set<string> = new Set();
        for (let reference of references) {
            // If we get both rule references and the rule itself then ignore the rule, because
            // we can continue with the references alone.
            if (references.length > 1 && this.symbolIsRule(reference)) {
                continue;
            }

            let owner = (reference.symbolTable as ContextSymbolTable).owner;
            if (owner) {
                let info: SymbolInfo = {
                    kind: SourceContext.getKindFromSymbol(reference),
                    name: name,
                    source: owner.fileName,
                    definition: SourceContext.definitionForContext(reference.context, true),
                    description: undefined,
                    symbolPath: resolveSymbolPaths ? reference.symbolPath : undefined
                }

                // The symbol itself?
                if (reference instanceof TokenSymbol
                    || reference instanceof FragmentTokenSymbol
                    || reference instanceof RuleSymbol
                ) {
                    result.push(info);
                    continue;
                }

                // All references to it.
                if (resolveSymbolPaths) {
                    // For references the path is at least 3 elements long: the symbol table,
                    // the referencing symbol and the reference. We have to resolve the referencing symbol too.
                    pending.push(info);
                    parentSymbols.add(_.nth(info.symbolPath!, -2).name);
                } else {
                    result.push(info);
                }
            }
        }

        while (pending.length > 0) {
            // Resolve the parent symbols too and merge their symbol paths with the one
            // of the pending info records.

            // At the same time prepare already the next iteration.
            let newPending: SymbolInfo[] = [];
            let newParentSymbols: Set<string> = new Set();

            for (let parentName of parentSymbols) {
                references = this.getAllNestedSymbols(parentName);
                for (let entry of pending) {
                    if (_.nth(entry.symbolPath!, -2).name == parentName) {
                        for (let parent of references) {
                            // Also here ignore the rule if we got both, rule references and the rule itself.
                            if (references.length > 1 && this.symbolIsRule(parent)) {
                                continue;
                            }
                            let info = _.clone(entry);

                            // Keep in mind here the symbol path is reversed (the symbol is at index 0 and each parent
                            // comes at higher indexes).
                            let pathLength = info.symbolPath!.length
                            info.symbolPath = _.concat(info.symbolPath!.slice(0, pathLength - 2), parent.symbolPath!);

                            // Stop iteration if we found a rule symbol (which is a top level element under a symbol table)
                            // or the path reached the starting entry again.
                            let nameToLookUp = _.nth(info.symbolPath!, -2).name;

                            // Check that this name appears at most once (to avoid endless recursion).
                            let nameCount = 0;
                            info.symbolPath!.forEach((symbol: Symbol) => { if (symbol.name == nameToLookUp) ++nameCount; });
                            if (!this.symbolIsRule(parent) && nameCount < 2) {
                                newPending.push(info);
                                newParentSymbols.add(nameToLookUp);
                            } else {
                                result.push(info);
                            }
                        }
                    }
                }
            }
            pending = newPending;
            parentSymbols = newParentSymbols;
        }

        return result;
    }


    public getSymbolOccurences(symbolName: string, localOnly: boolean, resolveSymbolPaths: boolean = false): SymbolInfo[] {
        return this.findNestedOccurencesFor(symbolName, resolveSymbolPaths);
    }

    private getSymbolOfType(name: string, kind: SymbolKind, localOnly: boolean): Symbol | undefined {
        switch (kind) {
            case SymbolKind.TokenVocab: {
                let options = this.resolve("options", true);
                if (options) {
                    return options.resolve(name, localOnly);
                }
            }
            case SymbolKind.Import:
                return this.resolve(name, localOnly) as ImportSymbol;
            case SymbolKind.BuiltInLexerToken:
                return this.resolve(name, localOnly) as BuiltInTokenSymbol;
            case SymbolKind.VirtualLexerToken:
                return this.resolve(name, localOnly) as VirtualTokenSymbol;
            case SymbolKind.FragmentLexerToken:
                return this.resolve(name, localOnly) as FragmentTokenSymbol;
            case SymbolKind.LexerToken:
                return this.resolve(name, localOnly) as TokenSymbol;
            case SymbolKind.BuiltInMode:
                return this.resolve(name, localOnly) as BuiltInModeSymbol;
            case SymbolKind.LexerMode:
                return this.resolve(name, localOnly) as LexerModeSymbol;
            case SymbolKind.BuiltInChannel:
                return this.resolve(name, localOnly) as BuiltInChannelSymbol;
            case SymbolKind.TokenChannel:
                return this.resolve(name, localOnly) as TokenChannelSymbol;
            case SymbolKind.ParserRule:
                return this.resolve(name, localOnly) as RuleSymbol;
        }

        return undefined;
    }

    private symbolReferences: Map<string, number> = new Map();

};

export class OptionSymbol extends Symbol {
    public value: string;
 }

export class ImportSymbol extends Symbol { }
export class BuiltInTokenSymbol extends Symbol { }
export class VirtualTokenSymbol extends Symbol { }
export class FragmentTokenSymbol extends ScopedSymbol { }
export class TokenSymbol extends ScopedSymbol { }
export class TokenReferenceSymbol extends Symbol { }
export class BuiltInModeSymbol extends Symbol { }
export class LexerModeSymbol extends Symbol { }
export class BuiltInChannelSymbol extends Symbol { }
export class TokenChannelSymbol extends Symbol { }
export class RuleSymbol extends ScopedSymbol { }
export class RuleReferenceSymbol extends Symbol { }
export class AlternativeSymbol extends ScopedSymbol { }
export class EbnfSuffixSymbol extends Symbol { }
export class OptionsSymbol extends ScopedSymbol { }
export class ArgumentSymbol extends ScopedSymbol { }
export class OperatorSymbol extends Symbol { }

export class ActionSymbol extends ScopedSymbol {
    public isPredicate: boolean = false;
}
