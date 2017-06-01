/*
 * This file is released under the MIT license.
 * Copyright (c) 2017, Mike Lischke
 *
 * See LICENSE file for more info.
 */

"use strict"

import * as fs from "fs-extra";
import * as crypto from "crypto";
import * as os from "os";
import * as path from "path";

import { ExtensionContext, Uri, window } from "vscode";

export class Utils {

    /**
     * Returns the absolute path to a file located in our misc folder.
     *
     * @param file The base file name.
     * @param context The context of this extension to get its path regardless where it is installed.
     */
    public static getMiscPath(file: string, context: ExtensionContext, asUri = false): string {
        if (asUri) {
            return Uri.file(context.asAbsolutePath(path.join('misc', file))).toString();
        }
        return Uri.file(context.asAbsolutePath(path.join('misc', file))).fsPath;
    }

    public static isAbsolute(p: string): boolean {
        return path.normalize(p + '/') === path.normalize(path.resolve(p) + '/');
    }

    public static deleteFolderRecursive(path: string) {
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    Utils.deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    public static hashFromPath(dataPath: string): string {
        return crypto.createHash('md5').update(dataPath).digest('hex');
    }

    /**
     * Copies all given files to the specified target folder if they don't already exist there
     * or are older than the source files.
     * @param files
     * @param targetPath
     */
    public static copyFilesIfNewer(files: string[], targetPath: string) {
        fs.ensureDir(targetPath, async (error: Error) => {
            for (let file of files) {
                try {
                    let canCopy = true;
                    let targetFile = path.join(targetPath, path.basename(file));
                    if (fs.existsSync(targetFile)) {
                        let sourceStat = fs.statSync(file);
                        let targetStat = fs.statSync(targetFile);
                        canCopy = targetStat.mtime < sourceStat.mtime;
                    }

                    if (canCopy) {
                        await fs.copy(file, targetFile, { overwrite: true });
                    }
                } catch (error) {
                    window.showErrorMessage("Could not copy file '" + file + "'. " + error);
                }
            }
        });
    }

    /**
     * Asks the user for a file to store the given data in. Checks if the file already exists and ask for permission to
     * overwrite it, if so. Also copies a number extra files to the target folder.
     *
     * @param fileName A default file name the user can change, if wanted.
     * @param extension The target file extension (including the dot).
     * @param prompt The prompt text for the file selection dialog.
     * @param data The data to write.
     * @param extraFiles Files to copy to the target folder (e.g. css).
     */
    public static exportDataWithConfirmation(fileName: string, extension: string, prompt: string, data: string, extraFiles: string[]) {
        window.showInputBox({
            value: fileName,
            placeHolder: "<Enter full file name here>",
            prompt: prompt
        }).then((value: string) => {
            if (value) try {
                if (path.extname(value) !== extension) {
                    value += extension;
                }

                if (fs.existsSync(value)) {
                    window.showWarningMessage("The specified file exists already", { modal: true }, ...["Overwrite"]).then((action: string) => {
                        if (action === "Overwrite") {
                            fs.writeFile(value, data, (error) => {
                                if (error) {
                                    window.showErrorMessage("Could not write to file: " + value + ": " + error.message);
                                } else {
                                    this.copyFilesIfNewer(extraFiles, path.dirname(value));
                                    window.showInformationMessage("Diagram successfully written to file '" + value + "'.");
                                }
                            });
                        }
                    });
                } else {
                    fs.writeFile(value, data, (error) => {
                        if (error) {
                            window.showErrorMessage("Could not write to file: " + value + ": " + error.message);
                        } else {
                            this.copyFilesIfNewer(extraFiles, path.dirname(value));
                            window.showInformationMessage("Diagram successfully written to file '" + value + "'.");
                        }
                    });
                }
            } catch (error) {
                window.showErrorMessage("Unexpected error encountered: " + error);
            }
        })
    }
};
