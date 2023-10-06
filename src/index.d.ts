/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

declare module "*.svg" {
    const content: string;
    export default content;
}

declare module "@unicode/*" {
    const content: number[];
    export default content;
}
