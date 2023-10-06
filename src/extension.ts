/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ExtensionContext } from "vscode";
import { ExtensionHost } from "./ExtensionHost.js";
import { AntlrFacade } from "./backend/facade.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let extensionHost: ExtensionHost;

/**
 * Entry function for the extension. Called when the extension is activated.
 *
 * @param context The extension context from vscode.
 */
export const activate = (context: ExtensionContext): void => {
    extensionHost = new ExtensionHost(context);

    AntlrFacade.initialize();
};
