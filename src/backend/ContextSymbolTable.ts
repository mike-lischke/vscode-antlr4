/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2020, Mike Lischke
 *
 * See LICENSE file for more info.
 */

/* eslint-disable max-classes-per-file */

import { ParserRuleContext } from "antlr4ts";
import { SymbolTable, Symbol, ScopedSymbol, SymbolTableOptions } from "antlr4-c3";

import { SymbolKind, SymbolGroupKind, SymbolInfo, CodeActionType } from "../backend/facade";
import { SourceContext } from "./SourceContext";
import { ParseTree } from "antlr4ts/tree";

export class ContextSymbolTable extends SymbolTable {
    public tree: ParserRuleContext; // Set by the owning source context after each parse run.

    private symbolReferences = new Map<string, number>();

    // Caches with reverse lookup for indexed symbols.
    private namedActions: Symbol[] = [];
    private parserActions: Symbol[] = [];
    private lexerActions: Symbol[] = [];
    private predicates: Symbol[] = [];

    public constructor(name: string, options: SymbolTableOptions, public owner?: SourceContext) {
        super(name, options);
    }

    public clear(): void {
        // Before clearing the dependencies make sure the owners are updated.
        if (this.owner) {
            for (const dep of this.dependencies) {
                if ((dep as ContextSymbolTable).owner) {
                    this.owner.removeDependency((dep as ContextSymbolTable).owner!);
                }
            }
        }

        this.symbolReferences.clear();
        this.namedActions = [];
        this.parserActions = [];
        this.lexerActions = [];
        this.predicates = [];

        super.clear();
    }

    public symbolExists(name: string, kind: SymbolKind, localOnly: boolean): boolean {
        return this.getSymbolOfType(name, kind, localOnly) !== undefined;
    }

    public symbolExistsInGroup(symbol: string, kind: SymbolGroupKind, localOnly: boolean): boolean {
        // Group of lookups.
        switch (kind) {
            case SymbolGroupKind.TokenRef: {
                if (this.symbolExists(symbol, SymbolKind.BuiltInLexerToken, localOnly)) {
                    return true;
                }
                if (this.symbolExists(symbol, SymbolKind.VirtualLexerToken, localOnly)) {
                    return true;
                }
                if (this.symbolExists(symbol, SymbolKind.FragmentLexerToken, localOnly)) {
                    return true;
                }
                if (this.symbolExists(symbol, SymbolKind.LexerRule, localOnly)) {
                    return true;
                }
                break;
            }

            case SymbolGroupKind.LexerMode: {
                if (this.symbolExists(symbol, SymbolKind.BuiltInMode, localOnly)) {
                    return true;
                }
                if (this.symbolExists(symbol, SymbolKind.LexerMode, localOnly)) {
                    return true;
                }
                break;
            }

            case SymbolGroupKind.TokenChannel: {
                if (this.symbolExists(symbol, SymbolKind.BuiltInChannel, localOnly)) {
                    return true;
                }
                if (this.symbolExists(symbol, SymbolKind.TokenChannel, localOnly)) {
                    return true;
                }
                break;
            }

            case SymbolGroupKind.RuleRef: {
                if (this.symbolExists(symbol, SymbolKind.ParserRule, localOnly)) {
                    return true;
                }
                break;
            }

            default: {
                break;
            }
        }

        return false;
    }

    public contextForSymbol(symbolName: string, kind: SymbolKind, localOnly: boolean): ParseTree | undefined {
        const symbol = this.getSymbolOfType(symbolName, kind, localOnly);
        if (!symbol) {
            return undefined;
        }

        return symbol.context;
    }

    public getSymbolInfo(symbol: string | Symbol): SymbolInfo | undefined {
        if (!(symbol instanceof Symbol)) {
            const temp = this.resolve(symbol);
            if (!temp) {
                return undefined;
            }
            symbol = temp;
        }

        const kind = SourceContext.getKindFromSymbol(symbol);
        const name = (symbol).name;

        // Special handling for imports.
        if (kind === SymbolKind.TokenVocab || kind === SymbolKind.Import) {
            // Get the source id from a dependent module.
            this.dependencies.forEach((table: ContextSymbolTable) => {
                if (table.owner && table.owner.sourceId.includes(name)) {
                    return { // TODO: implement a best match search.
                        kind,
                        name,
                        source: table.owner.fileName,
                        definition: SourceContext.definitionForContext(table.tree, true),
                    };
                }
            });
        }

        const symbolTable = symbol.symbolTable as ContextSymbolTable;

        return {
            kind,
            name,
            source: (symbol.context && symbolTable && symbolTable.owner) ? symbolTable.owner.fileName : "ANTLR runtime",
            definition: SourceContext.definitionForContext(symbol.context, true),
            description: undefined,
        };

    }

    public listTopLevelSymbols(localOnly: boolean): SymbolInfo[] {
        const result: SymbolInfo[] = [];

        const options = this.resolve("options", true);
        if (options) {
            const tokenVocab = options.resolve("tokenVocab", true);
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

    /**
     * Collects a list of action symbols.
     *
     * @param type The type of actions to return.
     *
     * @returns Symbol information for each defined action.
     */
    public listActions(type: CodeActionType): SymbolInfo[] {
        const result: SymbolInfo[] = [];

        try {
            let list;
            if (type === CodeActionType.Named) {
                list = this.namedActions;
            } else if (type === CodeActionType.Parser) {
                list = this.parserActions;
            } else if (type === CodeActionType.Lexer) {
                list = this.lexerActions;
            } else {
                list = this.predicates;
            }

            for (const entry of list) {
                const definition = SourceContext.definitionForContext(entry.context, true);
                if (definition && entry.name.toLowerCase() === "skip") {
                    // Seems there's a bug for the skip action where the parse tree indicates a single letter source range.
                    definition.range.end.column = definition.range.start.column + 3;
                }

                result.push({
                    kind: SourceContext.getKindFromSymbol(entry),
                    name: entry.name,
                    source: this.owner ? this.owner.fileName : "",
                    definition,
                    description: entry.context!.text,
                });
            }
        } catch (e) {
            result.push({
                kind: SymbolKind.Action,
                name: "Error getting actions list",
                description: "Internal error occurred while collecting the list of defined actions",
                source: "",
            });
        }

        return result;
    }

    public getReferenceCount(symbolName: string): number {
        const reference = this.symbolReferences.get(symbolName);
        if (reference) {
            return reference;
        } else {
            return 0;
        }
    }

    public getUnreferencedSymbols(): string[] {
        const result: string[] = [];
        for (const entry of this.symbolReferences) {
            if (entry[1] === 0) {
                result.push(entry[0]);
            }
        }

        return result;
    }

    public incrementSymbolRefCount(symbolName: string): void {
        const reference = this.symbolReferences.get(symbolName);
        if (reference) {
            this.symbolReferences.set(symbolName, reference + 1);
        } else {
            this.symbolReferences.set(symbolName, 1);
        }
    }

    public getSymbolOccurrences(symbolName: string, localOnly: boolean): SymbolInfo[] {
        const result: SymbolInfo[] = [];

        const symbols = this.getAllSymbols(Symbol, localOnly);
        for (const symbol of symbols) {
            const owner = (symbol.root as ContextSymbolTable).owner;

            if (owner) {
                if (symbol.context && symbol.name === symbolName) {
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
                        description: undefined,
                    });
                }

                if (symbol instanceof ScopedSymbol) {
                    const references = symbol.getAllNestedSymbols(symbolName);
                    for (const reference of references) {
                        result.push({
                            kind: SourceContext.getKindFromSymbol(reference),
                            name: symbolName,
                            source: owner.fileName,
                            definition: SourceContext.definitionForContext(reference.context, true),
                            description: undefined,
                        });
                    }
                }
            }
        }

        return result;
    }

    /**
     * Stores the given symbol in the named action cache.
     *
     * @param action The symbol representing the action.
     */
    public defineNamedAction(action: Symbol): void {
        this.namedActions.push(action);
    }

    /**
     * Stores the given symbol in the parser action cache.
     *
     * @param action The symbol representing the action.
     */
    public defineParserAction(action: Symbol): void {
        this.parserActions.push(action);
    }

    /**
     * Stores the given symbol in the lexer action cache. Lexer actions actually have an index (well, custom lexer
     * actions have), but at this point we don't know it yet, so we keep the action in a set.
     * Later we can correlate that with the ATN.lexerActions field.
     *
     * @param action The symbol representing the action.
     */
    public defineLexerAction(action: Symbol): void {
        this.lexerActions.push(action);
    }

    /**
     * Stores the given symbol in the predicate cache, if it isn't already there. The current size of the cache
     * defines its index, as used in predicate evaluation.
     *
     * @param predicate The symbol representing the predicate.
     */
    public definePredicate(predicate: Symbol): void {
        this.predicates.push(predicate);
    }

    /**
     * Does a depth-first search in the table for a symbol which contains the given context.
     * The search is based on the token indices which the context covers and goes down as much as possible to find
     * the closes covering symbol.
     *
     * @param context The context to search for.
     *
     * @returns The symbol covering the given context or undefined if nothing was found.
     */
    public symbolContainingContext(context: ParseTree): Symbol | undefined {
        const findRecursive = (parent: ScopedSymbol): Symbol | undefined => {
            for (const symbol of parent.children) {
                if (!symbol.context || symbol.context === context) {
                    continue;
                }

                if (symbol.context.sourceInterval.properlyContains(context.sourceInterval)) {
                    let child;
                    if (symbol instanceof ScopedSymbol) {
                        child = findRecursive(symbol);

                    }
                    if (child) {
                        return child;
                    } else {
                        return symbol;
                    }
                }
            }
        };

        return findRecursive(this);
    }

    private symbolsOfType<T extends Symbol>(t: new (...args: any[]) => T, localOnly = false): SymbolInfo[] {
        const result: SymbolInfo[] = [];

        const symbols = this.getAllSymbols(t, localOnly);
        for (const symbol of symbols) {
            const root = symbol.root as ContextSymbolTable;
            result.push({
                kind: SourceContext.getKindFromSymbol(symbol),
                name: symbol.name,
                source: root.owner ? root.owner.fileName : "ANTLR runtime",
                definition: SourceContext.definitionForContext(symbol.context, true),
                description: undefined,
            });
        }

        return result;
    }

    private getSymbolOfType(name: string, kind: SymbolKind, localOnly: boolean): Symbol | undefined {
        switch (kind) {
            case SymbolKind.TokenVocab: {
                const options = this.resolve("options", true);
                if (options) {
                    return options.resolve(name, localOnly);
                }
            }
            case SymbolKind.Import: {
                return this.resolve(name, localOnly) as ImportSymbol;
            }
            case SymbolKind.BuiltInLexerToken: {
                return this.resolve(name, localOnly) as BuiltInTokenSymbol;
            }
            case SymbolKind.VirtualLexerToken: {
                return this.resolve(name, localOnly) as VirtualTokenSymbol;
            }
            case SymbolKind.FragmentLexerToken: {
                return this.resolve(name, localOnly) as FragmentTokenSymbol;
            }
            case SymbolKind.LexerRule: {
                return this.resolve(name, localOnly) as TokenSymbol;
            }
            case SymbolKind.BuiltInMode: {
                return this.resolve(name, localOnly) as BuiltInModeSymbol;
            }
            case SymbolKind.LexerMode: {
                return this.resolve(name, localOnly) as LexerModeSymbol;
            }
            case SymbolKind.BuiltInChannel: {
                return this.resolve(name, localOnly) as BuiltInChannelSymbol;
            }
            case SymbolKind.TokenChannel: {
                return this.resolve(name, localOnly) as TokenChannelSymbol;
            }
            case SymbolKind.ParserRule: {
                return this.resolve(name, localOnly) as RuleSymbol;
            }

            default: {
                break;
            }
        }

        return undefined;
    }

}

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
export class NamedActionSymbol extends ScopedSymbol { }
export class LexerActionSymbol extends ScopedSymbol { }
export class ExceptionHandlerSymbol extends ScopedSymbol { }
export class FinallyClauseSymbol extends ScopedSymbol { }
export class ParserActionSymbol extends ScopedSymbol { }
export class PredicateSymbol extends Symbol { }
export class PredicateMarkerSymbol extends Symbol { }
export class ActionSymbol extends Symbol { }
