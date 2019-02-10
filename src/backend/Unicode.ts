/*
 * This file is released under the MIT license.
 * Copyright (c) 2019, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { IntervalSet, Interval } from "antlr4ts/misc";

let assignedIntervals: IntervalSet;

export let FULL_UNICODE_SET = new IntervalSet([new Interval(0, 0x10FFFF)]);

export interface UnicodeOptions {
    // The CJK scripts consist of so many code points, any generated random string will contain mostly CJK
    // characters (Chinese/Japanese/Korean), if not excluded. However, only certain scripts are removed by this setting, namely:
    // - CJK Unified Ideographs (+ Extension A)
    // - Yi Syllables
    // - Hangul Syllables
    // - CJK Compatibility Ideographs
    excludeCJK?: boolean;

    // Right-to-left characters don't fit well in the standard left-to-right direction, especially when
    // generated randomly, so allow excluding them as well.
    excludeRTL?: boolean;

    // Exclude any character beyond the basic multilingual pane (0x10000 and higher).
    limitToBMP?: boolean;
};

/**
 * Creates an interval set with all printable Unicode characters.
 *
 * @param options Values that specify the Unicode set to create.
 */
export function printableUnicodePoints(options: UnicodeOptions): IntervalSet {
    if (!assignedIntervals) {
        // Create a set with all Unicode code points that are assigned and not in categories with unprintable chars,
        // surrogate pairs, formatting + private codes.
        let intervalsToExclude = codePointsToIntervals('General_Category/Unassigned/code-points.js');
        intervalsToExclude = codePointsToIntervals('General_Category/Control/code-points.js', intervalsToExclude);
        intervalsToExclude = codePointsToIntervals('General_Category/Format/code-points.js', intervalsToExclude);
        intervalsToExclude = codePointsToIntervals('General_Category/Surrogate/code-points.js', intervalsToExclude);
        intervalsToExclude = codePointsToIntervals('General_Category/Private_use/code-points.js', intervalsToExclude);

        if (options.excludeCJK) {
            intervalsToExclude = codePointsToIntervals('Block/CJK_Unified_Ideographs/code-points.js', intervalsToExclude);
            intervalsToExclude = codePointsToIntervals('Block/CJK_Unified_Ideographs_Extension_A/code-points.js', intervalsToExclude);
            intervalsToExclude = codePointsToIntervals('Block/CJK_Compatibility_Ideographs/code-points.js', intervalsToExclude);
            intervalsToExclude = codePointsToIntervals('Block/Hangul_Syllables/code-points.js', intervalsToExclude);
            intervalsToExclude = codePointsToIntervals('Block/Yi_Syllables/code-points.js', intervalsToExclude);
        }

        if (options.excludeRTL) {
            // Note: there are also a few top-to-bottom scripts (e.g. mongolian), but these are not considered here.
            intervalsToExclude = codePointsToIntervals('Bidi_Class/Right_To_Left/code-points.js', intervalsToExclude);
            intervalsToExclude = codePointsToIntervals('Bidi_Class/Right_To_Left_Embedding/code-points.js', intervalsToExclude);
            intervalsToExclude = codePointsToIntervals('Bidi_Class/Right_To_Left_Isolate/code-points.js', intervalsToExclude);
            intervalsToExclude = codePointsToIntervals('Bidi_Class/Right_To_Left_Override/code-points.js', intervalsToExclude);
        }

        let sourceIntervals: IntervalSet;
        if (options.limitToBMP) {
            sourceIntervals = IntervalSet.COMPLETE_CHAR_SET;
        } else {
            sourceIntervals = FULL_UNICODE_SET;
        }

        assignedIntervals = intervalsToExclude.complement(sourceIntervals);
    }
    return assignedIntervals;
}

/**
 * Converts the code points from the given file to an interval set.
 */
function codePointsToIntervals(dataFile: string, existing?: IntervalSet): IntervalSet {
    let charsToExclude = require('unicode-11.0.0/' + dataFile);
    let result = existing ? existing : new IntervalSet([]);

    // Code points are sorted in increasing order, which we can use to speed up insertion.
    let start = charsToExclude[0];
    let end = start;
    for (let i = 1; i < charsToExclude.length; ++i) {
        let code = charsToExclude[i];
        if (end + 1 == code) {
            ++end
            continue;
        }

        result.add(start, end);
        start = code;
        end = code;
    }

    result.add(start, end);

    return result;
}
