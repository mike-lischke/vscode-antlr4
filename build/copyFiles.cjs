/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

const fs = require("fs");

const source = "node_modules/antlr4ng-cli/antlr4-4.13.2-SNAPSHOT-complete.jar";
const target = "out/antlr4-4.13.2-SNAPSHOT-complete.jar";

if (!fs.existsSync(target)) {
    fs.copyFileSync(source, target);
}
