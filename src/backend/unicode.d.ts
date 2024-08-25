/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

declare interface IUnicodeRange {
    begin: number;
    end: number;
    length: number;
}

declare interface IDataFileContent {
    default: IUnicodeRange[];
}

declare module "@unicode/unicode-15.1.0/*" {
    const rangeData: IUnicodeRange[];
    export default rangeData;
}
