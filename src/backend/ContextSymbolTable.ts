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
import { ParseTree } from 'antlr4ts/tree';

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

    public addNewSymbol(kind: SymbolKind, name: string, ctx: ParserRuleContext) {
        let symbol: Symbol;
        switch (kind) {
            case SymbolKind.TokenVocab:
                symbol = this.addNewSymbolOfType(TokenVocabSymbol, undefined, name);
                break;
            case SymbolKind.Import:
                symbol = this.addNewSymbolOfType(ImportSymbol, undefined, name);
                break;
            case SymbolKind.BuiltInLexerToken:
                symbol = this.addNewSymbolOfType(BuiltInTokenSymbol, undefined, name);
                break;
            case SymbolKind.VirtualLexerToken:
                symbol = this.addNewSymbolOfType(VirtualTokenSymbol, undefined, name);
                break;
            case SymbolKind.FragmentLexerToken:
                symbol = this.addNewSymbolOfType(FragmentTokenSymbol, undefined, name);
                break;
            case SymbolKind.LexerToken:
                symbol = this.addNewSymbolOfType(TokenSymbol, undefined, name);
                break;
            case SymbolKind.BuiltInMode:
                symbol = this.addNewSymbolOfType(BuiltInModeSymbol, undefined, name);
                break;
            case SymbolKind.LexerMode:
                symbol = this.addNewSymbolOfType(LexerModeSymbol, undefined, name);
                break;
            case SymbolKind.BuiltInChannel:
                symbol = this.addNewSymbolOfType(BuiltInChannelSymbol, undefined, name);
                break;
            case SymbolKind.TokenChannel:
                symbol = this.addNewSymbolOfType(TokenChannelSymbol, undefined, name);
                break;
            default: // SymbolKind.ParserRule
                symbol = this.addNewSymbolOfType(RuleSymbol, undefined, name);
                break;
        }
        symbol.context = ctx;
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

    public listSymbols(localOnly: boolean): SymbolInfo[] {
        let result: SymbolInfo[] = [];

        result.push(...this.symbolsOfType(TokenVocabSymbol, localOnly));
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

    public getSymbolOccurences(symbolName: string, localOnly: boolean): SymbolInfo[] {
        let result: SymbolInfo[] = [];

        let symbols = this.getAllSymbols(Symbol, localOnly);
        for (let symbol of symbols) {
            let owner = (symbol.root as ContextSymbolTable).owner;

            if (owner) {
                if (symbol.context && symbol.name == symbolName) {
                    let context = symbol.context;
                    if (symbol instanceof FragmentTokenSymbol) {
                        context = (symbol.context as ParserRuleContext).children![1];
                    } else if (symbol instanceof TokenSymbol || symbol instanceof RuleSymbol) {
                        context = (symbol.context as ParserRuleContext).children![0];
                    }

                    result.push({
                        kind: SourceContext.getKindFromSymbol(symbol),
                        name: symbolName,
                        source: owner.fileName,
                        definition: SourceContext.definitionForContext(context, true),
                        description: undefined
                    });
                }

                if (symbol instanceof ScopedSymbol) {
                    let references = symbol.getAllNestedSymbols(symbolName);
                    for (let reference of references) {
                        result.push({
                            kind: SourceContext.getKindFromSymbol(reference),
                            name: symbolName,
                            source: owner.fileName,
                            definition: SourceContext.definitionForContext(reference.context, true),
                            description: undefined
                        });
                    }
                }
            }
        }

        return result;
    }

    private getSymbolOfType(name: string, kind: SymbolKind, localOnly: boolean): Symbol | undefined {
        switch (kind) {
            case SymbolKind.TokenVocab:
                return this.resolve(name, localOnly) as TokenVocabSymbol;
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

export class TokenVocabSymbol extends Symbol { }
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
