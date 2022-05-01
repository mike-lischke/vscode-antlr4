/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as fs from "fs";
import * as path from "path";

import { Vocabulary } from "antlr4ts";

export interface IContextEntry {
    context: SourceContext;
    refCount: number;
    dependencies: string[];
    grammar: string; // The grammar file name.
}

// Import modules that depend on these enums after their definition, to allow for static initializations.
import { SourceContext } from "./SourceContext";
import { GrammarDebugger } from "./GrammarDebugger";
import {
    ISelfDiagnostics, ISymbolInfo, CodeActionType, IDiagnosticEntry, IReferenceNode, IGenerationOptions,
    IAtnGraphData, ISentenceGenerationOptions, IFormattingOptions, IContextDetails,
} from "./types";

export class AntlrFacade {
    // Mapping file names to SourceContext instances.
    private sourceContexts: Map<string, IContextEntry> = new Map<string, IContextEntry>();

    public constructor(private importDir: string, private extensionDir: string) {
    }

    /**
     * Info for unit tests.
     *
     * @returns An object with interesting details (currently only the number of existing contexts).
     */
    public getSelfDiagnostics(): ISelfDiagnostics {
        return {
            contextCount: this.sourceContexts.keys.length,
        };
    }

    public getContext(fileName: string, source?: string | undefined): SourceContext {
        const contextEntry = this.sourceContexts.get(fileName);
        if (!contextEntry) {
            return this.loadGrammar(fileName, source);
        }

        return contextEntry.context;
    }

    /**
     * Call this to refresh the internal input stream as a preparation to a reparse call
     * or for code completion.
     * Does nothing if no grammar has been loaded for that file name.
     *
     * @param fileName The grammar file name.
     * @param source The grammar code.
     */
    public setText(fileName: string, source: string): void {
        const contextEntry = this.sourceContexts.get(fileName);
        if (contextEntry) {
            contextEntry.context.setText(source);
        }
    }

    /**
     * Triggers a parse run for the given file name. This grammar must have been loaded before.
     *
     * @param fileName The grammar file name.
     */
    public reparse(fileName: string): void {
        const contextEntry = this.sourceContexts.get(fileName);
        if (contextEntry) {
            this.parseGrammar(contextEntry);
        }
    }

    public loadGrammar(fileName: string, source?: string): SourceContext {
        let contextEntry = this.sourceContexts.get(fileName);
        if (!contextEntry) {
            if (!source) {
                try {
                    fs.statSync(fileName);
                    source = fs.readFileSync(fileName, "utf8");
                } catch (e) {
                    source = "";
                }
            }

            const context = new SourceContext(fileName, this.extensionDir);
            contextEntry = { context, refCount: 0, dependencies: [], grammar: fileName };
            this.sourceContexts.set(fileName, contextEntry);

            // Do an initial parse run and load all dependencies of this context
            // and pass their references to this context.
            context.setText(source);
            this.parseGrammar(contextEntry);
        }
        contextEntry.refCount++;

        return contextEntry.context;
    }

    public releaseGrammar(fileName: string): void {
        this.internalReleaseGrammar(fileName);
    }

    public symbolInfoAtPosition(fileName: string, column: number, row: number,
        limitToChildren = true): ISymbolInfo | undefined {
        const context = this.getContext(fileName);

        return context.symbolAtPosition(column, row, limitToChildren);
    }

    public infoForSymbol(fileName: string, symbol: string): ISymbolInfo | undefined {
        const context = this.getContext(fileName);

        return context.getSymbolInfo(symbol);
    }

    public enclosingSymbolAtPosition(fileName: string, column: number, row: number,
        ruleScope = false): ISymbolInfo | undefined {
        const context = this.getContext(fileName);

        return context.enclosingSymbolAtPosition(column, row, ruleScope);
    }

    /**
     * Returns a list of top level symbols from a file (and optionally its dependencies).
     *
     * @param fileName The grammar file name.
     * @param fullList If true, includes symbols from all dependencies as well.
     * @returns A list of symbol info entries.
     */
    public listTopLevelSymbols(fileName: string, fullList: boolean): ISymbolInfo[] {
        const context = this.getContext(fileName);

        return context.listTopLevelSymbols(!fullList);
    }

    /**
     * Returns the vocabulary for the given file (if it contains lexer rules).
     *
     * @param fileName The grammar file name.
     * @returns The vocabulary if found.
     */
    public getLexerVocabulary(fileName: string): Vocabulary | undefined {
        const context = this.getContext(fileName);

        return context.getVocabulary();
    }

    /**
     * Returns a list of rule names for the given file (if it contains parser rules).
     *
     * @param fileName The grammar file name.
     * @returns The list of rule names.
     */
    public getRuleList(fileName: string): string[] | undefined {
        const context = this.getContext(fileName);

        return context.getRuleList();
    }

    /**
     * Returns a list of channel names for the given file (if it contains lexer rules).
     *
     * @param fileName The grammar file name.
     * @returns The list of channel names.
     */
    public getChannels(fileName: string): string[] | undefined {
        const context = this.getContext(fileName);

        return context.getChannels();
    }

    /**
     * Returns a list of lexer modes for the given file (if it contains lexer rules).
     *
     * @param fileName The grammar file name.
     * @returns The list of mode names.
     */
    public getModes(fileName: string): string[] | undefined {
        const context = this.getContext(fileName);

        return context.getModes();
    }

    /**
     * Returns a list of actions found in the given file.
     *
     * @param fileName The grammar file name.
     * @param type The of actions to return.
     * @returns The list of actions.
     */
    public listActions(fileName: string, type: CodeActionType): ISymbolInfo[] {
        const context = this.getContext(fileName);

        return context.listActions(type);
    }

    public getActionCounts(fileName: string): Map<CodeActionType, number> {
        const context = this.getContext(fileName);

        return context.getActionCounts();
    }

    public async getCodeCompletionCandidates(fileName: string, column: number, row: number): Promise<ISymbolInfo[]> {
        const context = this.getContext(fileName);

        return context.getCodeCompletionCandidates(column, row);
    }

    public getDiagnostics(fileName: string): IDiagnosticEntry[] {
        const context = this.getContext(fileName);

        return context.getDiagnostics();
    }

    public ruleFromPosition(fileName: string, column: number, row: number): [string | undefined, number | undefined] {
        const context = this.getContext(fileName);

        return context.ruleFromPosition(column, row);
    }

    /**
     * Count how many times a symbol has been referenced. The given file must contain the definition of this symbol.
     *
     * @param fileName The grammar file name.
     * @param symbol The symbol for which to determine the reference count.
     * @returns The reference count.
     */
    public countReferences(fileName: string, symbol: string): number {
        const context = this.getContext(fileName);

        return context.getReferenceCount(symbol);
    }

    /**
     * Determines source file and position of all occurrences of the given symbol. The search includes
     * also all referencing and referenced contexts.
     *
     * @param fileName The grammar file name.
     * @param symbolName The name of the symbol to check.
     * @returns A list of symbol info entries, each describing one occurrence.
     */
    public getSymbolOccurrences(fileName: string, symbolName: string): ISymbolInfo[] {
        const context = this.getContext(fileName);
        const result = context.symbolTable.getSymbolOccurrences(symbolName, false);

        // Sort result by kind. This way rule definitions appear before rule references and are re-parsed first.
        return result.sort((lhs: ISymbolInfo, rhs: ISymbolInfo) => {
            return lhs.kind - rhs.kind;
        });
    }

    public getDependencies(fileName: string): string[] {
        const entry = this.sourceContexts.get(fileName);
        if (!entry) {
            return [];
        }
        const dependencies: Set<SourceContext> = new Set();
        this.pushDependencyFiles(entry, dependencies);

        const result: string[] = [];
        for (const dep of dependencies) {
            result.push(dep.fileName);
        }

        return result;
    }

    public getReferenceGraph(fileName: string): Map<string, IReferenceNode> {
        const context = this.getContext(fileName);

        return context.getReferenceGraph();
    }

    public getRRDScript(fileName: string, rule: string): string {
        const context = this.getContext(fileName);

        return context.getRRDScript(rule) || "";
    }

    public generate(fileName: string, options: IGenerationOptions): Promise<string[]> {
        const context = this.getContext(fileName);
        const dependencies: Set<SourceContext> = new Set();
        this.pushDependencyFiles(this.sourceContexts.get(fileName)!, dependencies);

        return context.generate(dependencies, options);
    }

    public getATNGraph(fileName: string, rule: string): IAtnGraphData | undefined {
        const context = this.getContext(fileName);

        return context.getATNGraph(rule);
    }

    public generateSentence(fileName: string, rule: string, options: ISentenceGenerationOptions,
        callback: (sentence: string, index: number) => void): void {
        const context = this.getContext(fileName);

        const dependencies = new Set<SourceContext>();
        this.pushDependencyFiles(this.sourceContexts.get(fileName)!, dependencies);

        const basePath = path.dirname(fileName);

        for (const dependency of dependencies) {
            if (dependency.hasErrors) {
                callback("[Fix grammar errors first]", 0);

                return;
            }

            if (!dependency.isInterpreterDataLoaded) {
                dependency.setupInterpreters(path.join(basePath, ".antlr"));
            }
        }

        context.generateSentence(dependencies, rule, options, callback);
    }

    public lexTestInput(fileName: string, input: string, actionFile?: string): [string[], string] {
        const context = this.getContext(fileName);

        return context.lexTestInput(input, actionFile);
    }

    public parseTestInput(fileName: string, input: string, startRule: string, actionFile?: string): string[] {
        const context = this.getContext(fileName);

        return context.parseTestInput(input, startRule, actionFile);
    }

    public formatGrammar(fileName: string, options: IFormattingOptions, start: number,
        stop: number): [string, number, number] {
        const context = this.getContext(fileName);

        return context.formatGrammar(options, start, stop);
    }

    public hasErrors(fileName: string): boolean {
        const context = this.getContext(fileName);

        return context.hasErrors;
    }

    public createDebugger(fileName: string, actionFile: string, dataDir: string): GrammarDebugger | undefined {
        const context = this.getContext(fileName);
        if (!context) {
            return;
        }

        const contexts: Set<SourceContext> = new Set();
        contexts.add(context);
        this.pushDependencyFiles(this.sourceContexts.get(fileName)!, contexts);

        for (const dependency of contexts) {
            if (dependency.hasErrors) {
                return;
            }

            if (!dependency.isInterpreterDataLoaded) {
                dependency.setupInterpreters(dataDir);
            }
        }

        return new GrammarDebugger([...contexts], actionFile);
    }

    public getContextDetails(fileName: string): IContextDetails {
        const context = this.getContext(fileName);

        return context.info;
    }

    private loadDependency(contextEntry: IContextEntry, depName: string): SourceContext | undefined {
        // The given import dir is used to locate the dependency (either relative to the base path or via an
        // absolute path).
        // If we cannot find the grammar file that way we try the base folder.
        const basePath = path.dirname(contextEntry.grammar);
        const fullPath = path.isAbsolute(this.importDir) ? this.importDir : path.join(basePath, this.importDir);
        try {
            const depPath = path.join(fullPath, depName + ".g4");
            fs.accessSync(depPath, fs.constants.R_OK);
            // Target path can be read. Now check the target file.
            contextEntry.dependencies.push(depPath);

            return this.loadGrammar(depPath);
        } catch (e) {
            // ignore
        }

        // File not found. Try other extension.
        try {
            const depPath = path.join(fullPath, depName + ".g");
            fs.accessSync(depPath, fs.constants.R_OK);
            // Target path can be read. Now check the target file.
            contextEntry.dependencies.push(depPath);

            return this.loadGrammar(depPath);
        } catch (e) {
            // ignore
        }

        // Couldn't find it in the import folder. Use the base then.
        try {
            const depPath = path.join(basePath, depName + ".g4");
            fs.statSync(depPath);
            contextEntry.dependencies.push(depPath);

            return this.loadGrammar(depPath);
        } catch (e) {
            // ignore
        }

        try {
            const depPath = path.join(basePath, depName + ".g");
            fs.statSync(depPath);
            contextEntry.dependencies.push(depPath);

            return this.loadGrammar(depPath);
        } catch (e) {
            // ignore
        }

        // Ignore the dependency if we cannot find the source file for it.
        return undefined;
    }

    private parseGrammar(contextEntry: IContextEntry) {
        const oldDependencies = contextEntry.dependencies;
        contextEntry.dependencies = [];
        const newDependencies = contextEntry.context.parse();

        for (const dep of newDependencies) {
            const depContext = this.loadDependency(contextEntry, dep);
            if (depContext) { contextEntry.context.addAsReferenceTo(depContext); }
        }

        // Release all old dependencies. This will only unload grammars which have
        // not been ref-counted by the above dependency loading (or which are not used by other
        // grammars).
        for (const dep of oldDependencies) { this.releaseGrammar(dep); }
    }

    private internalReleaseGrammar(fileName: string, referencing?: IContextEntry): void {
        const contextEntry = this.sourceContexts.get(fileName);
        if (contextEntry) {
            if (referencing) {
                // If a referencing context is given remove this one from the reference's dependencies list,
                // which in turn will remove the referencing context from the dependency's referencing list.
                referencing.context.removeDependency(contextEntry.context);
            }

            contextEntry.refCount--;
            if (contextEntry.refCount === 0) {
                this.sourceContexts.delete(fileName);

                // Release also all dependencies.
                for (const dep of contextEntry.dependencies) {
                    this.internalReleaseGrammar(dep, contextEntry);
                }
            }
        }
    }

    private pushDependencyFiles(entry: IContextEntry, contexts: Set<SourceContext>) {
        // Using a set for the context list here, to automatically exclude duplicates.
        for (const dep of entry.dependencies) {
            const depEntry = this.sourceContexts.get(dep);
            if (depEntry) {
                this.pushDependencyFiles(depEntry, contexts);
                contexts.add(depEntry.context);
            }
        }
    }


}
