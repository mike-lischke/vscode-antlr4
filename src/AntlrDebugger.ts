/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import {
    DebugSession, LoggingDebugSession, Handles, InitializedEvent, logger, Logger, Thread, Scope, Source, OutputEvent,
    TerminatedEvent, StoppedEvent, Breakpoint, BreakpointEvent, StackFrame
} from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol/lib/debugProtocol';

import { window, workspace, WorkspaceFolder, commands, Uri } from "vscode";
import * as fs from "fs-extra";
import * as path from "path";

import { GrapsDebugger, AntlrLanguageSupport, ParseTreeNode, ParseTreeNodeType, GrapsBreakPoint } from "antlr4-graps";

import { TokenListProvider } from "./TokenListProvider";
import { getTextProviderUri } from './TextContentProvider';

/**
 * Interface that reflects the arguments as specified in package.json.
 */
interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    input: string;
    startRule: string;
    grammar: string;
    stopOnEntry?: boolean;
    trace?: boolean;
    printParseTree?: boolean;
    visualParseTree?: boolean;
}

export interface DebuggerConsumer {
    debugger: GrapsDebugger;

    refresh(): void; // A full reload, e.g. after a grammar change.
    debuggerStopped(): void; // Called after each stop of the debugger (step, pause, breakpoint).
}

export class AntlrDebugSession extends LoggingDebugSession {
    /**
	 * Creates a new debug adapter that is used for one debug session.
	 * We configure the default implementation of a debug adapter here.
	 */
    constructor(
        private folder: WorkspaceFolder,
        private backend: AntlrLanguageSupport,
        private grammar: string,
        private consumers: DebuggerConsumer[]) {
        super("antlr4-vscode-trace.txt");

        // this backend uses zero-based lines and columns
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);
    }

    shutdown(): void {
    }

	/**
	 * The 'initialize' request is the first request called by the frontend
	 * to interrogate the features the debug adapter provides.
	 */
    protected initializeRequest(response: DebugProtocol.InitializeResponse,
        args: DebugProtocol.InitializeRequestArguments): void {

        let d = this.backend.createDebugger(this.grammar)!;
        if (!d) {
            throw Error("No interpreter data available. Make sure you have set the \"antlr4.generation.mode\" setting to at least \"internal\"");
        }

        d.on('stopOnStep', () => {
            this.notifyConsumers();
            this.sendEvent(new StoppedEvent('step', AntlrDebugSession.THREAD_ID));
        });

        d.on('stopOnPause', () => {
            this.notifyConsumers();
            this.sendEvent(new StoppedEvent('pause', AntlrDebugSession.THREAD_ID));
        });

        d.on('stopOnBreakpoint', () => {
            this.notifyConsumers();
            this.sendEvent(new StoppedEvent('breakpoint', AntlrDebugSession.THREAD_ID));
        });

        d.on('stopOnException', () => {
            this.notifyConsumers();
            this.sendEvent(new StoppedEvent('exception', AntlrDebugSession.THREAD_ID));
        });

        d.on('breakpointValidated', (bp: GrapsBreakPoint) => {
            this.sendEvent(new BreakpointEvent('changed', <DebugProtocol.Breakpoint>{ verified: bp.validated, id: bp.id }));
        });

        d.on('output', (text, filePath, line, column, isError) => {
            const e: DebugProtocol.OutputEvent = new OutputEvent(`${text}\n`);
            e.body.source = this.createSource(filePath);
            e.body.line = line;
            e.body.column = column;
            e.body.category = isError ? "stderr" : "stdout";
            this.sendEvent(e);
        });

        d.on('end', () => {
            if (this.showTextualParseTree) {
                let tree = this.debugger.currentParseTree;
                if (tree) {
                    let text = this.parseNodeToString(tree);
                    this.sendEvent(new OutputEvent("Parse Tree:\n" + text + "\n"));
                } else {
                    this.sendEvent(new OutputEvent("No Parse Tree\n"));
                }
            }

            if (this.showGraphicalParseTree) {
                commands.executeCommand('vscode.previewHtml',
                    getTextProviderUri(Uri.parse("http://debugger.net"), "parse-tree", ""), 1,
                    "Parse Tree").then((success: boolean) => {
                    }, (reason) => {
                        window.showErrorMessage(reason);
                    });
            }

            this.sendEvent(new TerminatedEvent());
        });

        this.debugger = d;
        for (let consumer of this.consumers) {
            consumer.debugger = d;
            consumer.refresh();
        }

        // Send initialized event as early as possible to get our breakpoints before the launch request.
        // Otherwise the breakpoints are not ready in time.
        this.sendEvent(new InitializedEvent());

        response.body = response.body || {};
        response.body.supportsConfigurationDoneRequest = true;
        //response.body.supportsStepInTargetsRequest = false;

        this.sendResponse(response);
    }

    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse,
        args: DebugProtocol.ConfigurationDoneArguments) {

    }

    protected launchRequest(response: DebugProtocol.LaunchResponse, args: LaunchRequestArguments): void {
        logger.setup(args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop, false);

        this.showTextualParseTree = args.printParseTree || false;
        this.showGraphicalParseTree = args.visualParseTree || false;

        try {
            let testInput = fs.readFileSync(args.input, { encoding: "utf8" });

            let startRuleIndex = this.debugger.ruleIndexFromName(args.startRule);
            if (startRuleIndex < 0) {
                this.sendErrorResponse(response, {
                    id: 1,
                    format: "Error while launching debug session: start rule \"" + args.startRule + "\" not found"
                });
                return;
            }
            this.debugger.start(startRuleIndex, testInput);
        } catch (e) {
            this.sendErrorResponse(response, { id: 1, format: "Error while launching debug session: " + e });
            return;
        }

        this.sendResponse(response);
    }

    protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): void {
        this.debugger.clearBreakPoints();
        if (args.breakpoints && args.source.path) {
            const actualBreakpoints = args.breakpoints.map(source => {
                let { validated, line, id } = this.debugger.addBreakPoint(args.source.path!, source.line);
                const bp = <DebugProtocol.Breakpoint>new Breakpoint(validated, line);
                bp.id = id;
                return bp;
            });

            response.body = {
                breakpoints: actualBreakpoints
            };
        }
        this.sendResponse(response);
    }

    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
        // We have no threads, so return a dummy entry.
        response.body = {
            threads: [
                new Thread(AntlrDebugSession.THREAD_ID, "Interpreter")
            ]
        };
        this.sendResponse(response);
    }

    protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): void {

        const startFrame = typeof args.startFrame === 'number' ? args.startFrame : 0;
        const maxLevels = typeof args.levels === 'number' ? args.levels : 1000;

        const stack = this.debugger.currentStackTrace;
        let frames: StackFrame[] = [];
        for (let i = 0; i < stack.length; ++i) {
            let entry = stack[i];
            let frame = new StackFrame(i, entry.name, this.createSource(entry.source),
                entry.definition!.range.start.row, entry.definition!.range.start.column);
                frames.push(frame);
        }
        response.body = {
            stackFrames: frames,
            totalFrames: stack.length
        };
        this.sendResponse(response);
    }

    protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {
        const frameReference = args.frameId;
        response.body = {
            scopes: []
        };
        this.sendResponse(response);
    }

    protected variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments): void {
        response.body = {
            variables: []
        };
        this.sendResponse(response);
    }

    protected pauseRequest(response: DebugProtocol.PauseResponse, args: DebugProtocol.PauseArguments): void {
        this.debugger.pause();
        this.sendResponse(response);
    }

    protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): void {
        this.debugger.continue();
        this.sendResponse(response);
    }

    protected nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): void {
        this.debugger.stepOver();
        this.sendResponse(response);
    }

    protected stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments): void {
        this.debugger.stepIn();
        this.sendResponse(response);
    }

    protected stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments): void {
        this.debugger.stepOut();
        this.sendResponse(response);
    }

    protected evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments): void {
        let reply: string | undefined = undefined;
        /*
                if (args.context === 'repl') {
                    // 'evaluate' supports to create and delete breakpoints from the 'repl':
                    const matches = /new +([0-9]+)/.exec(args.expression);
                    if (matches && matches.length === 2) {
                        const mbp = this._runtime.setBreakPoint(this._runtime.sourceFile, this.convertClientLineTobackend(parseInt(matches[1])));
                        const bp = <DebugProtocol.Breakpoint> new Breakpoint(mbp.verified, this.convertbackendLineToClient(mbp.line), undefined, this.createSource(this._runtime.sourceFile));
                        bp.id= mbp.id;
                        this.sendEvent(new BreakpointEvent('new', bp));
                        reply = `breakpoint created`;
                    } else {
                        const matches = /del +([0-9]+)/.exec(args.expression);
                        if (matches && matches.length === 2) {
                            const mbp = this._runtime.clearBreakPoint(this._runtime.sourceFile, this.convertClientLineTobackend(parseInt(matches[1])));
                            if (mbp) {
                                const bp = <DebugProtocol.Breakpoint> new Breakpoint(false);
                                bp.id= mbp.id;
                                this.sendEvent(new BreakpointEvent('removed', bp));
                                reply = `breakpoint deleted`;
                            }
                        }
                    }
                }*/

        response.body = {
            result: reply ? reply : `evaluate(context: '${args.context}', '${args.expression}')`,
            variablesReference: 0
        };
        this.sendResponse(response);
    }

    //---- helpers

    private createSource(filePath: string): Source {
        return new Source(path.basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, 'antlr-data');
    }

    private parseNodeToString(node: ParseTreeNode, level: number = 0): string {
        let result = " ".repeat(level);
        switch (node.type) {
            case ParseTreeNodeType.Rule: {
                let name = this.debugger.ruleNameFromIndex(node.ruleIndex!);
                result += name ? name : "<unknown rule>";

                if (node.children.length > 0) {
                    result += " (\n";
                    for (let child of node.children) {
                        result += this.parseNodeToString(child, level + 1);
                    }
                    result += " ".repeat(level) + ")\n";
                }
                break;
            }

            case ParseTreeNodeType.Error: {
                result += " <Error>";
                if (node.symbol) {
                    result += "\"" + node.symbol.text + "\"\n";
                }
                break;
            }

            case ParseTreeNodeType.Terminal: {
                result += "\"" + node.symbol!.text + "\"\n";
                break;
            }

            default:
                break;
        }

        return result;
    }

    private notifyConsumers() {
        for (let consumer of this.consumers) {
            consumer.debuggerStopped();
        }
    }

    private static THREAD_ID = 1;
    private debugger: GrapsDebugger;
    private showTextualParseTree = false;
    private showGraphicalParseTree = false;
}
