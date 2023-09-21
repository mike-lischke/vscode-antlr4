/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { ExtensionContext } from "vscode";
import { ExtensionHost } from "./ExtensionHost.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let extensionHost: ExtensionHost;

/**
 * Entry function for the extension. Called when the extension is activated.
 *
 * @param context The extension context from vscode.
 */
export const activate = (context: ExtensionContext): void => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    extensionHost = new ExtensionHost(context);
};
