/*
 * This file is released under the MIT license.
 * Copyright (c) 2016, 2020, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { ExtensionContext } from "vscode";
import { ExtensionHost } from "./ExtensionHost";

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
