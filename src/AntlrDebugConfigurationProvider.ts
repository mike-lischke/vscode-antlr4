/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import * as Net from "net";

import {
    CancellationToken, DebugConfiguration, DebugConfigurationProvider, ProviderResult, workspace, WorkspaceFolder,
    window,
} from "vscode";

import { AntlrFacade } from "./backend/facade.js";
import { AntlrDebugSession } from "./frontend/AntlrDebugAdapter.js";
import { ParseTreeProvider } from "./frontend/webviews/ParseTreeProvider.js";

/**
 * Validates launch configuration for grammar debugging.
 */
export class AntlrDebugConfigurationProvider implements DebugConfigurationProvider {
    private server?: Net.Server;

    public constructor(private backend: AntlrFacade, private parseTreeProvider: ParseTreeProvider) { }

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
