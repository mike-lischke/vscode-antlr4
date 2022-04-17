/*
 * This file is released under the MIT license.
 * Copyright (c) 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import * as Net from "net";

import {
    CancellationToken, DebugConfiguration, DebugConfigurationProvider, ProviderResult, workspace, WorkspaceFolder,
    window,
} from "vscode";

import { AntlrFacade } from "./backend/facade";
import { AntlrDebugSession } from "./frontend/AntlrDebugAdapter";
import { AntlrParseTreeProvider } from "./frontend/webviews/ParseTreeProvider";

/**
 * Validates launch configuration for grammar debugging.
 */
export class AntlrDebugConfigurationProvider implements DebugConfigurationProvider {
    private server?: Net.Server;

    public constructor(private backend: AntlrFacade, private parseTreeProvider: AntlrParseTreeProvider) { }

    public resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration,
        _token?: CancellationToken): ProviderResult<DebugConfiguration> {

        if (workspace.getConfiguration("antlr4.generation").mode === "none") {
            void window.showErrorMessage("Interpreter data generation is disabled in the preferences (see " +
                "'antlr4.generation'). Set this at least to 'internal' to enable debugging.");

            return null;
        }

        if (!this.server) {
            this.server = Net.createServer((socket) => {
                socket.on("end", () => {
                    //console.error('>> ANTLR debugging client connection closed\n');
                });

                const session = new AntlrDebugSession(folder, this.backend, [this.parseTreeProvider]);
                session.setRunAsServer(true);
                session.start(socket, socket);
            }).listen(0);
        }

        const info = this.server.address() as Net.AddressInfo;
        if (info) {
            config.debugServer = info.port;
        } else {
            config.debugServer = 0;
        }

        return config;
    }

    public dispose(): void {
        if (this.server) {
            this.server.close();
        }
    }
}
