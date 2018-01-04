/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, 2018, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import {
    DebugSession, LoggingDebugSession, Handles, InitializedEvent, logger, Logger, Thread, Scope, Source, OutputEvent,
    TerminatedEvent, StoppedEvent
} from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol/lib/debugProtocol';

import { basename } from 'path';
import { window, workspace } from "vscode";
import * as fs from "fs-extra";

import { GrapsDebugger, AntlrLanguageSupport, ParseTreeNode, ParseTreeNodeType } from "antlr4-graps";

import { TokenListProvider } from "./TokenListProvider";

/**
 * Interface that reflects the arguments as specified in package.json.
 */
interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    input: string;
    stopOnEntry?: boolean;
    trace?: boolean;

    grammar: string;
}

export interface DebuggerConsumer {
    debugger: GrapsDebugger;

    refresh(): void;
}

export class AntlrDebugSession extends LoggingDebugSession {
    private static THREAD_ID = 1;

    /**
	 * Creates a new debug adapter that is used for one debug session.
	 * We configure the default implementation of a debug adapter here.
	 */
    constructor(private backend: AntlrLanguageSupport, private consumers: DebuggerConsumer[]) {
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

        // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
        // we request them early by sending an 'initializeRequest' to the frontend.
        // The frontend will end the configuration sequence by calling 'configurationDone' request.
        this.sendEvent(new InitializedEvent());

        response.body = response.body || {};
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsFunctionBreakpoints = true;
        response.body.supportsStepInTargetsRequest = true;
        //response.body.supportsCompletionsRequest?: boolean;
        //response.body.supportsValueFormattingOptions?: boolean;

        this.sendResponse(response);
    }

    protected launchRequest(response: DebugProtocol.LaunchResponse, args: LaunchRequestArguments): void {
        logger.setup(args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop, false);

        try {
            let testInput = fs.readFileSync(args.input, { encoding: "utf8" });
            let d = this.backend.createDebugger(args.grammar, "lexer.g4", "parser.g4", testInput)!;
            if (!d) {
                throw Error("No interpreter data available. Make sure you have set the \"antlr4.generation.mode\" setting to at least \"internal\"");
            }

            d.on('stopOnEntry', () => {
                this.sendEvent(new StoppedEvent('entry', AntlrDebugSession.THREAD_ID));
            });
            d.on('stopOnStep', () => {
                this.sendEvent(new StoppedEvent('step', AntlrDebugSession.THREAD_ID));
            });
            d.on('stopOnBreakpoint', () => {
                this.sendEvent(new StoppedEvent('breakpoint', AntlrDebugSession.THREAD_ID));
            });
            d.on('stopOnException', () => {
                this.sendEvent(new StoppedEvent('exception', AntlrDebugSession.THREAD_ID));
            });
            /*d.on('breakpointValidated', (bp: MockBreakpoint) => {
                this.sendEvent(new BreakpointEvent('changed', <DebugProtocol.Breakpoint>{ verified: bp.verified, id: bp.id }));
            });*/
            d.on('output', (text, filePath, line, column, isError) => {
                const e: DebugProtocol.OutputEvent = new OutputEvent(`${text}\n`);
                e.body.source = this.createSource(filePath);
                e.body.line = line;
                e.body.column = column;
                e.body.category = isError ? "stderr" : "stdout";
                this.sendEvent(e);
            });
            d.on('end', () => {
                let showTree = workspace.getConfiguration("antlr4.debug")["printParseTree"];
                if (showTree) {
                    let tree = this.debugger.currentParseTree;
                    if (tree) {
                        let text = this.parseNodeToString(tree);
                        this.sendEvent(new OutputEvent("Parse Tree:\n" + text + "\n"));
                    } else {
                        this.sendEvent(new OutputEvent("No Parse Tree\n"));
                    }
                }
                this.sendEvent(new TerminatedEvent());
            });

            this.debugger = d;
            for (let consumer of this.consumers) {
                consumer.debugger = d;
                consumer.refresh();
            }
        } catch (e) {
            this.sendErrorResponse(response, { id: 1, format: "Error while launching debug session: " + e });
            return;
        }
        this.debugger.start(!!args.stopOnEntry);

        this.sendResponse(response);
    }

    protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): void {
        const path = <string>args.source.path;
        const clientLines = args.lines || [];

        // clear all breakpoints for this file
		/*this._runtime.clearBreakpoints(path);

		// set and verify breakpoint locations
		const actualBreakpoints = clientLines.map(l => {
			let { verified, line, id } = this._runtime.setBreakPoint(path, this.convertClientLineTobackend(l));
			const bp = <DebugProtocol.Breakpoint> new Breakpoint(verified, this.convertbackendLineToClient(line));
			bp.id= id;
			return bp;
		});

		// send back the actual breakpoint positions
		response.body = {
			breakpoints: actualBreakpoints
		};
		this.sendResponse(response);*/
    }

    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
        //        this.sendEvent(new OutputEvent("Threads request\n"));
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
        const endFrame = startFrame + maxLevels;
        /*
                const stk = this._runtime.stack(startFrame, endFrame);

                response.body = {
                    stackFrames: stk.frames.map(f => new StackFrame(f.index, f.name, this.createSource(f.file), this.convertbackendLineToClient(f.line))),
                    totalFrames: stk.count
                };*/
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

    protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): void {
        this.debugger.continue();
        this.sendResponse(response);
    }

    protected reverseContinueRequest(response: DebugProtocol.ReverseContinueResponse, args: DebugProtocol.ReverseContinueArguments): void {
        this.sendResponse(response);
    }

    protected nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): void {
        this.debugger.step();
        this.sendResponse(response);
    }

    protected stepBackRequest(response: DebugProtocol.StepBackResponse, args: DebugProtocol.StepBackArguments): void {
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
        return new Source(basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, 'antlr-data');
    }

    private parseNodeToString(node: ParseTreeNode, level: number = 0): string {
        let result = " ".repeat(level);
        switch (node.type) {
            case ParseTreeNodeType.Rule: {
                let name = this.debugger.ruleName(node.ruleIndex!);
                result +=  name ? name : "<unknown rule>";

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

    private debugger: GrapsDebugger;
}
