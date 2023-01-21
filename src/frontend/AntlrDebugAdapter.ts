/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

// Have to disable these rules here for the await-notify functionality.
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
    DebugSession, InitializedEvent, Thread, Scope, Source, OutputEvent,
    TerminatedEvent, StoppedEvent, Breakpoint, BreakpointEvent, StackFrame,
} from "@vscode/debugadapter";
import { DebugProtocol } from "@vscode/debugprotocol";

import { window, Uri, WorkspaceFolder } from "vscode";
import * as fs from "fs-extra";
import * as path from "path";
import { Subject } from "await-notify";

import { GrammarDebugger, IGrammarBreakPoint } from "../backend/GrammarDebugger";
import { ParseTreeProvider } from "./webviews/ParseTreeProvider";
import { AntlrFacade } from "../backend/facade";
import { CommonToken } from "antlr4ts";
import { IParseTreeNode } from "../backend/types";

/**
 * Interface that reflects the arguments as specified in package.json.
 */
export interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    input: string;
    startRule: string;
    grammar: string;
    actionFile: string;
    stopOnEntry?: boolean;
    trace?: boolean;
    printParseTree?: boolean;
    visualParseTree?: boolean;
}

export interface IDebuggerConsumer {
    debugger: GrammarDebugger;

    updateContent(uri: Uri): void;
    debuggerStopped(uri: Uri): void; // Called after each stop of the debugger (step, pause, breakpoint).
}

enum VarRef {
    Globals = 1000,
    ParseTree = 1002,
    Context = 2000,
    Tokens = 3000,
    SingleToken = 10000,
}

export class AntlrDebugSession extends DebugSession {
    private static threadId = 1;

    private debugger: GrammarDebugger | undefined;
    private parseTreeProvider?: ParseTreeProvider;
    private configurationDone = new Subject();

    private showTextualParseTree = false;
    private showGraphicalParseTree = false;
    private testInput = "";

    // Some variables, which are updated between each scope/var request.
    private tokens: CommonToken[] | undefined;
    private variables: Array<[string, string]>;

    /**
     * Creates a new debug adapter that is used for one debug session.
     * We configure the default implementation of a debug adapter here.
     *
     * @param folder The current workspace folder for resolving file paths.
     * @param backend Our extension backend.
     * @param consumers A list of consumers that need a notification on certain events during debug.
     */
    public constructor(
        private folder: WorkspaceFolder | undefined,
        private backend: AntlrFacade,
        private consumers: IDebuggerConsumer[]) {
        super();

        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(false);

        if (consumers[0] instanceof ParseTreeProvider) {
            this.parseTreeProvider = consumers[0];
        }
    }

    public shutdown(): void {
        // Nothing to do for now.
    }

    protected initializeRequest(response: DebugProtocol.InitializeResponse,
        _args: DebugProtocol.InitializeRequestArguments): void {

        response.body = {
            supportsConfigurationDoneRequest: true,
            supportsStepInTargetsRequest: true,
            supportsDelayedStackTraceLoading: false,
        };

        this.sendResponse(response);
    }

    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse,
        args: DebugProtocol.ConfigurationDoneArguments): void {

        super.configurationDoneRequest(response, args);
        this.configurationDone.notify();
    }

    protected launchRequest(response: DebugProtocol.LaunchResponse, args: ILaunchRequestArguments): void {
        if (!args.input) {
            this.sendErrorResponse(response, {
                id: 1,
                format: "Could not launch debug session: no test input file specified",
            });

            return;
        }

        if (!path.isAbsolute(args.input) && this.folder) {
            args.input = path.join(this.folder.uri.fsPath, args.input);
        }

        if (!fs.existsSync(args.input)) {
            this.sendErrorResponse(response, {
                id: 1,
                format: "Could not launch debug session: test input file not found.",
            });

            return;
        }

        if (args.actionFile) {
            if (!path.isAbsolute(args.actionFile) && this.folder) {
                args.actionFile = path.join(this.folder.uri.fsPath, args.actionFile);
            }

            if (!fs.existsSync(args.actionFile)) {
                void window.showInformationMessage(
                    "Cannot find file for semantic predicate evaluation. No evaluation will take place.",
                );
            }
        }

        if (!args.grammar) {
            this.sendErrorResponse(response, {
                id: 1,
                // eslint-disable-next-line no-template-curly-in-string
                format: "Could not launch debug session: no grammar file specified (use the ${file} macro for the " +
                    "current editor).",
            });

            return;
        }

        if (path.extname(args.grammar) !== ".g4") {
            this.sendErrorResponse(response, {
                id: 1,
                format: "Could not launch debug session: " + args.grammar + " is not a grammar file",
            });

            return;
        }

        if (!path.isAbsolute(args.grammar) && this.folder) {
            args.grammar = path.join(this.folder.uri.fsPath, args.grammar);
        }

        if (!fs.existsSync(args.grammar)) {
            this.sendErrorResponse(response, {
                id: 1,
                format: "Could not launch debug session: cannot find grammar file.",
            });

            return;
        }

        if (this.backend.hasErrors(args.grammar)) {
            this.sendErrorResponse(response, {
                id: 1,
                format: "Could not launch debug session: the grammar contains issues.",
            });

            return;
        }

        try {
            this.setup(args.grammar, args.actionFile);
            for (const consumer of this.consumers) {
                consumer.debugger = this.debugger!;
                consumer.updateContent(Uri.file(args.grammar));
            }
            this.sendEvent(new InitializedEvent()); // Now we can accept breakpoints.
        } catch (e) {
            this.sendErrorResponse(response, { id: 1, format: "Could not prepare debug session:\n\n" + String(e) });

            return;
        }

        // Need to wait here for the configuration to be done, which happens after break points are set.
        // This in turn is triggered by sending the InitializedEvent above.
        this.configurationDone.wait(1000).then(() => {
            this.showTextualParseTree = args.printParseTree || false;
            this.showGraphicalParseTree = args.visualParseTree || false;
            this.testInput = args.input;

            try {
                const testInput = fs.readFileSync(args.input, { encoding: "utf8" });

                const startRuleIndex = args.startRule ? this.debugger!.ruleIndexFromName(args.startRule) : 0;

                if (startRuleIndex < 0) {
                    this.sendErrorResponse(response, {
                        id: 2,
                        format: "Error while launching debug session: start rule \"" + args.startRule + "\" not found",
                    });

                    return;
                }

                this.debugger!.start(startRuleIndex, testInput, args.noDebug ? true : false);
            } catch (e) {
                this.sendErrorResponse(response, { id: 3, format: "Could not launch debug session:\n\n" + String(e) });

                return;
            }

            this.sendResponse(response);
        });
    }

    protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse,
        args: DebugProtocol.SetBreakpointsArguments): void {
        this.debugger!.clearBreakPoints();
        if (args.breakpoints && args.source.path) {
            const actualBreakpoints = args.breakpoints.map((sourceBreakPoint) => {
                const { validated, line, id } = this.debugger!.addBreakPoint(args.source.path!,
                    this.convertDebuggerLineToClient(sourceBreakPoint.line));
                const targetBreakPoint = <DebugProtocol.Breakpoint>new Breakpoint(validated,
                    this.convertClientLineToDebugger(line));
                targetBreakPoint.id = id;

                return targetBreakPoint;
            });

            response.body = {
                breakpoints: actualBreakpoints,
            };
        }
        this.sendResponse(response);
    }

    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
        // We have no threads, so return a dummy entry.
        response.body = {
            threads: [
                new Thread(AntlrDebugSession.threadId, "Interpreter"),
            ],
        };
        this.sendResponse(response);
    }

    protected stackTraceRequest(response: DebugProtocol.StackTraceResponse,
        args: DebugProtocol.StackTraceArguments): void {

        if (!this.debugger) {
            response.body = {
                stackFrames: [],
                totalFrames: 0,
            };
            this.sendResponse(response);

            return;
        }

        const startFrame = typeof args.startFrame === "number" ? args.startFrame : 0;
        const maxLevels = typeof args.levels === "number" ? args.levels : 1000;

        const stack = this.debugger.currentStackTrace;
        const frames: StackFrame[] = [];
        for (let i = startFrame; i < stack.length; ++i) {
            const entry = stack[i];
            let frame: StackFrame;
            if (entry.next.length > 0) {
                frame = new StackFrame(i, entry.name,
                    this.createSource(entry.source),
                    this.convertDebuggerLineToClient(entry.next[0].start.row),
                    this.convertDebuggerColumnToClient(entry.next[0].start.column),
                );

                frame.presentationHint = "normal";
            } else {
                // We arrive here usually because an internal problem came up.
                // See if we can use the same line/column coordinates as the previous frame.
                let line = this.convertDebuggerLineToClient(1);
                let column = this.convertDebuggerColumnToClient(0);
                if (frames.length > 0) {
                    line = frames[frames.length - 1].line;
                    column = frames[frames.length - 1].column;
                }

                frame = new StackFrame(i, entry.name + " <missing next>",
                    this.createSource(entry.source),
                    line,
                    column,
                );

                frame.presentationHint = "label";
            }
            frames.push(frame);

            if (frames.length > maxLevels) {
                break;
            }
        }

        response.body = {
            stackFrames: frames,
            totalFrames: stack.length,
        };
        this.sendResponse(response);
    }

    protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {
        // Cache a few values that stay the same during a single request for scopes and variables.
        if (this.debugger) {
            this.tokens = this.debugger.tokenList;
            this.debugger.getVariables(args.frameId).then((values) => {
                this.variables = values;
                const scopes: Scope[] = [];
                scopes.push(new Scope("Globals", VarRef.Globals, true));
                //scopes.push(new Scope(this.debugger.getStackInfo(args.frameId), VarRef.Context, false));
                response.body = {
                    scopes,
                };
                this.sendResponse(response);
            }).catch(() => {
                this.sendResponse(response);
            });
        }
    }

    protected variablesRequest(response: DebugProtocol.VariablesResponse,
        args: DebugProtocol.VariablesArguments): void {
        const variables: DebugProtocol.Variable[] = [];

        switch (args.variablesReference) {
            case VarRef.Globals: {
                if (this.tokens && this.debugger) {
                    variables.push({
                        name: "Test Input",
                        type: "string",
                        value: this.testInput,
                        variablesReference: 0,
                    });
                    variables.push({
                        name: "Input Size",
                        type: "number",
                        value: this.debugger.inputSize.toString(),
                        variablesReference: 0,
                    });
                    variables.push({
                        name: "Error Count",
                        type: "number",
                        value: this.debugger.errorCount.toString(),
                        variablesReference: 0,
                    });
                    variables.push({
                        name: "Input Tokens",
                        value: (this.tokens.length - this.debugger.currentTokenIndex).toString(),
                        variablesReference: VarRef.Tokens,
                        indexedVariables: this.tokens.length - this.debugger.currentTokenIndex,
                    });
                }

                break;
            }

            case VarRef.Context: { // Context related
                break;
            }

            case VarRef.Tokens: {
                if (this.tokens) {
                    const start = this.debugger!.currentTokenIndex + (args.start ? args.start : 0);
                    const length = args.count ? args.count : this.tokens.length;
                    for (let i = 0; i < length; ++i) {
                        const index = start + i;
                        variables.push({
                            name: `${index}: ${this.debugger!.tokenTypeName(this.tokens[index])}`,
                            type: "Token",
                            value: "",
                            variablesReference: VarRef.Tokens + index,
                            presentationHint: { kind: "class", attributes: ["readonly"] },
                        });
                    }
                }

                break;
            }

            default: {
                if (args.variablesReference >= VarRef.Tokens && this.tokens) {
                    const tokenIndex = args.variablesReference % VarRef.Tokens;
                    if (tokenIndex >= 0 && tokenIndex < this.tokens.length) {
                        const token = this.tokens[tokenIndex];
                        variables.push({
                            name: "text",
                            type: "string",
                            value: token.text ?? "",
                            variablesReference: 0,
                        });

                        variables.push({
                            name: "type",
                            type: "number",
                            value: String(token.type),
                            variablesReference: 0,
                        });

                        variables.push({
                            name: "line",
                            type: "number",
                            value: String(token.line),
                            variablesReference: 0,
                        });

                        variables.push({
                            name: "offset",
                            type: "number",
                            value: String(token.charPositionInLine),
                            variablesReference: 0,
                        });

                        variables.push({
                            name: "channel",
                            type: "number",
                            value: String(token.channel),
                            variablesReference: 0,
                        });

                        variables.push({
                            name: "tokenIndex",
                            type: "number",
                            value: String(token.tokenIndex),
                            variablesReference: 0,
                        });

                        variables.push({
                            name: "startIndex",
                            type: "number",
                            value: String(token.startIndex),
                            variablesReference: 0,
                        });

                        variables.push({
                            name: "stopIndex",
                            type: "number",
                            value: String(token.stopIndex),
                            variablesReference: 0,
                        });

                    }
                }
                break;
            }
        }

        response.body = {
            variables,
        };
        this.sendResponse(response);
    }

    protected pauseRequest(response: DebugProtocol.PauseResponse, _args: DebugProtocol.PauseArguments): void {
        this.debugger?.pause();
        this.sendResponse(response);
    }

    protected continueRequest(response: DebugProtocol.ContinueResponse, _args: DebugProtocol.ContinueArguments): void {
        this.debugger?.continue();
        this.sendResponse(response);
    }

    protected nextRequest(response: DebugProtocol.NextResponse, _args: DebugProtocol.NextArguments): void {
        this.debugger?.stepOver();
        this.sendResponse(response);

    }

    protected stepInRequest(response: DebugProtocol.StepInResponse, _args: DebugProtocol.StepInArguments): void {
        this.debugger?.stepIn();
        this.sendResponse(response);

    }

    protected stepOutRequest(response: DebugProtocol.StepOutResponse, _args: DebugProtocol.StepOutArguments): void {
        this.debugger?.stepOut();
        this.sendResponse(response);

    }

    protected evaluateRequest(response: DebugProtocol.EvaluateResponse, _args: DebugProtocol.EvaluateArguments): void {
        response.body = {
            result: "evaluation not supported",
            variablesReference: 0,
        };
        this.sendResponse(response);
    }

    private setup(grammar: string, actionFile: string) {
        const basePath = path.dirname(grammar);
        this.debugger = this.backend.createDebugger(grammar, actionFile, path.join(basePath, ".antlr"));
        if (!this.debugger) {
            throw Error("Debugger creation failed. There are grammar errors.");
        }

        if (!this.debugger.isValid) {
            throw Error("Debugger creation failed. You are either trying to debug an unsupported file type or " +
                "no interpreter data has been generated yet for the given grammar.");
        }

        this.debugger.on("stopOnStep", () => {
            this.notifyConsumers(Uri.file(grammar));
            this.sendEvent(new StoppedEvent("step", AntlrDebugSession.threadId));
        });

        this.debugger.on("stopOnPause", () => {
            this.notifyConsumers(Uri.file(grammar));
            this.sendEvent(new StoppedEvent("pause", AntlrDebugSession.threadId));
        });

        this.debugger.on("stopOnBreakpoint", () => {
            this.notifyConsumers(Uri.file(grammar));
            this.sendEvent(new StoppedEvent("breakpoint", AntlrDebugSession.threadId));
        });

        this.debugger.on("stopOnException", () => {
            this.notifyConsumers(Uri.file(grammar));
            this.sendEvent(new StoppedEvent("exception", AntlrDebugSession.threadId));
        });

        this.debugger.on("breakpointValidated", (bp: IGrammarBreakPoint) => {
            const breakpoint: DebugProtocol.Breakpoint = {
                verified: bp.validated,
                id: bp.id,
            };
            this.sendEvent(new BreakpointEvent("changed", breakpoint));
        });

        this.debugger.on("output", (...args: unknown[]) => {
            const isError = args[4] as boolean;
            const column = args[3] as number;
            const line = args[2] as number;
            const filePath = args[1] as string;
            const text = args[0] as string;

            const e: DebugProtocol.OutputEvent = new OutputEvent(`${text}\n`);
            e.body.source = filePath ? this.createSource(filePath) : undefined;
            e.body.line = line;
            e.body.column = column;
            e.body.category = isError ? "stderr" : "stdout";
            this.sendEvent(e);
        });

        this.debugger.on("end", () => {
            this.notifyConsumers(Uri.file(grammar));
            if (this.showTextualParseTree) {
                let text = "";
                if (!this.tokens) {
                    this.tokens = this.debugger?.tokenList;
                }

                const recognizer = this.debugger?.recognizer;
                this.tokens?.forEach((token) => {
                    text += token.toString(recognizer) + "\n";
                });
                this.sendEvent(new OutputEvent("Tokens:\n" + text + "\n"));

                const tree = this.debugger?.currentParseTree;
                if (tree) {
                    const treeText = this.parseNodeToString(tree);
                    this.sendEvent(new OutputEvent("Parse Tree:\n" + treeText + "\n"));
                } else {
                    this.sendEvent(new OutputEvent("No Parse Tree\n"));
                }
            }

            if (this.showGraphicalParseTree) {
                this.parseTreeProvider?.showWebview(Uri.file(grammar), {
                    title: "Parse Tree: " + path.basename(grammar),
                });
            }

            this.sendEvent(new TerminatedEvent());
        });

        this.debugger.on("error", (reason: string) => {
            const e: DebugProtocol.OutputEvent = new OutputEvent(`${reason}\n`);
            e.body.category = "stderr";
            this.sendEvent(e);
        });
    }

    //---- helpers

    private createSource(filePath: string): Source {
        return new Source(path.basename(filePath),
            this.convertDebuggerPathToClient(filePath), undefined, undefined, "antlr-data");
    }

    private parseNodeToString(node: IParseTreeNode, level = 0): string {
        let result = " ".repeat(level);
        switch (node.type) {
            case "rule": {
                const name = this.debugger!.ruleNameFromIndex(node.ruleIndex!);
                result += name ? name : "<unknown rule>";

                if (node.children.length > 0) {
                    result += " (\n";
                    for (const child of node.children) {
                        result += this.parseNodeToString(child, level + 1);
                    }
                    result += " ".repeat(level) + ")\n";
                }
                break;
            }

            case "error": {
                result += " <Error>";
                if (node.symbol) {
                    result += "\"" + node.symbol.text + "\"\n";
                }
                break;
            }

            case "terminal": {
                result += "\"" + node.symbol!.text + "\"\n";
                break;
            }

            default:
        }

        return result;
    }

    private notifyConsumers(uri: Uri) {
        for (const consumer of this.consumers) {
            consumer.debuggerStopped(uri);
        }
    }

    private escapeText(input: string): string {
        let result = "";
        for (const c of input) {
            switch (c) {
                case "\n": {
                    result += "\\n";
                    break;
                }

                case "\r": {
                    result += "\\r";
                    break;
                }

                case "\t": {
                    result += "\\t";
                    break;
                }

                default: {
                    result += c;
                    break;
                }
            }
        }

        return result;
    }
}
