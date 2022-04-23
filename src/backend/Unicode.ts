/*
 * This file is released under the MIT license.
 * Copyright (c) 2019, 2022, Mike Lischke
 *
 * See LICENSE file for more info.
 */

import { IntervalSet, Interval } from "antlr4ts/misc";

// This structure contains all currently defined Unicode blocks (according to https://unicode-table.com/en/blocks/)
// together with a weight value that determines the probability to select a given block in the random block selection.
const unicodeBlocks: Array<[Interval, string, number]> = [
    [new Interval(0x0000, 0x001F), "Control character", 0],
    [new Interval(0x0020, 0x007F), "Basic Latin", 100],
    [new Interval(0x0080, 0x00FF), "Latin-1 Supplement", 30],
    [new Interval(0x0100, 0x017F), "Latin Extended-A", 20],
    [new Interval(0x0180, 0x024F), "Latin Extended-B", 20],
    [new Interval(0x0250, 0x02AF), "IPA Extensions", 5],
    [new Interval(0x02B0, 0x02FF), "Spacing Modifier Letters", 3],
    [new Interval(0x0300, 0x036F), "Combining Diacritical Marks", 4],
    [new Interval(0x0370, 0x03FF), "Greek and Coptic", 20],
    [new Interval(0x0400, 0x04FF), "Cyrillic", 20],
    [new Interval(0x0500, 0x052F), "Cyrillic Supplement", 20],
    [new Interval(0x0530, 0x058F), "Armenian", 5],
    [new Interval(0x0590, 0x05FF), "Hebrew", 5],
    [new Interval(0x0600, 0x06FF), "Arabic", 5],
    [new Interval(0x0700, 0x074F), "Syriac", 5],
    [new Interval(0x0750, 0x077F), "Arabic Supplement", 5],
    [new Interval(0x0780, 0x07BF), "Thaana", 5],
    [new Interval(0x07C0, 0x07FF), "NKo", 5],
    [new Interval(0x0800, 0x083F), "Samaritan", 5],
    [new Interval(0x0840, 0x085F), "Mandaic", 5],
    [new Interval(0x0860, 0x086F), "Syriac Supplement", 5],
    [new Interval(0x08A0, 0x08FF), "Arabic Extended-A", 5],
    [new Interval(0x0900, 0x097F), "Devanagari", 5],
    [new Interval(0x0980, 0x09FF), "Bengali", 5],
    [new Interval(0x0A00, 0x0A7F), "Gurmukhi", 5],
    [new Interval(0x0A80, 0x0AFF), "Gujarati", 5],
    [new Interval(0x0B00, 0x0B7F), "Oriya", 5],
    [new Interval(0x0B80, 0x0BFF), "Tamil", 5],
    [new Interval(0x0C00, 0x0C7F), "Telugu", 5],
    [new Interval(0x0C80, 0x0CFF), "Kannada", 5],
    [new Interval(0x0D00, 0x0D7F), "Malayalam", 5],
    [new Interval(0x0D80, 0x0DFF), "Sinhala", 5],
    [new Interval(0x0E00, 0x0E7F), "Thai", 5],
    [new Interval(0x0E80, 0x0EFF), "Lao", 5],
    [new Interval(0x0F00, 0x0FFF), "Tibetan", 5],
    [new Interval(0x1000, 0x109F), "Myanmar", 5],
    [new Interval(0x10A0, 0x10FF), "Georgian", 5],
    [new Interval(0x1100, 0x11FF), "Hangul Jamo", 5],
    [new Interval(0x1200, 0x137F), "Ethiopic", 5],
    [new Interval(0x1380, 0x139F), "Ethiopic Supplement", 5],
    [new Interval(0x13A0, 0x13FF), "Cherokee", 5],
    [new Interval(0x1400, 0x167F), "Unified Canadian Aboriginal Syllabics", 5],
    [new Interval(0x1680, 0x169F), "Ogham", 5],
    [new Interval(0x16A0, 0x16FF), "Runic", 5],
    [new Interval(0x1700, 0x171F), "Tagalog", 5],
    [new Interval(0x1720, 0x173F), "Hanunoo", 5],
    [new Interval(0x1740, 0x175F), "Buhid", 5],
    [new Interval(0x1760, 0x177F), "Tagbanwa", 5],
    [new Interval(0x1780, 0x17FF), "Khmer", 5],
    [new Interval(0x1800, 0x18AF), "Mongolian", 5],
    [new Interval(0x18B0, 0x18FF), "Unified Canadian Aboriginal Syllabics Extended", 5],
    [new Interval(0x1900, 0x194F), "Limbu", 5],
    [new Interval(0x1950, 0x197F), "Tai Le", 5],
    [new Interval(0x1980, 0x19DF), "New Tai Lue", 5],
    [new Interval(0x19E0, 0x19FF), "Khmer Symbols", 4],
    [new Interval(0x1A00, 0x1A1F), "Buginese", 5],
    [new Interval(0x1A20, 0x1AAF), "Tai Tham", 5],
    [new Interval(0x1AB0, 0x1AFF), "Combining Diacritical Marks Extended", 3],
    [new Interval(0x1B00, 0x1B7F), "Balinese", 5],
    [new Interval(0x1B80, 0x1BBF), "Sundanese", 5],
    [new Interval(0x1BC0, 0x1BFF), "Batak", 5],
    [new Interval(0x1C00, 0x1C4F), "Lepcha", 5],
    [new Interval(0x1C50, 0x1C7F), "Ol Chiki", 5],
    [new Interval(0x1C80, 0x1C8F), "Cyrillic Extended C", 20],
    [new Interval(0x1CC0, 0x1CCF), "Sundanese Supplement", 5],
    [new Interval(0x1CD0, 0x1CFF), "Vedic Extensions", 5],
    [new Interval(0x1D00, 0x1D7F), "Phonetic Extensions", 5],
    [new Interval(0x1D80, 0x1DBF), "Phonetic Extensions Supplement", 5],
    [new Interval(0x1DC0, 0x1DFF), "Combining Diacritical Marks Supplement", 5],
    [new Interval(0x1E00, 0x1EFF), "Latin Extended Additional", 20],
    [new Interval(0x1F00, 0x1FFF), "Greek Extended", 20],
    [new Interval(0x2000, 0x206F), "General Punctuation", 3],
    [new Interval(0x2070, 0x209F), "Superscripts and Subscripts", 3],
    [new Interval(0x20A0, 0x20CF), "Currency Symbols", 3],
    [new Interval(0x20D0, 0x20FF), "Combining Diacritical Marks for Symbols", 1],
    [new Interval(0x2100, 0x214F), "Letterlike Symbols", 5],
    [new Interval(0x2150, 0x218F), "Number Forms", 5],
    [new Interval(0x2190, 0x21FF), "Arrows", 3],
    [new Interval(0x2200, 0x22FF), "Mathematical Operators", 3],
    [new Interval(0x2300, 0x23FF), "Miscellaneous Technical", 3],
    [new Interval(0x2400, 0x243F), "Control Pictures", 3],
    [new Interval(0x2440, 0x245F), "Optical Character Recognition", 3],
    [new Interval(0x2460, 0x24FF), "Enclosed Alphanumerics", 4],
    [new Interval(0x2500, 0x257F), "Box Drawing", 3],
    [new Interval(0x2580, 0x259F), "Block Elements", 3],
    [new Interval(0x25A0, 0x25FF), "Geometric Shapes", 3],
    [new Interval(0x2600, 0x26FF), "Miscellaneous Symbols", 3],
    [new Interval(0x2700, 0x27BF), "Dingbats", 3],
    [new Interval(0x27C0, 0x27EF), "Miscellaneous Mathematical Symbols-A", 3],
    [new Interval(0x27F0, 0x27FF), "Supplemental Arrows-A", 3],
    [new Interval(0x2800, 0x28FF), "Braille Patterns", 10],
    [new Interval(0x2900, 0x297F), "Supplemental Arrows-B", 3],
    [new Interval(0x2980, 0x29FF), "Miscellaneous Mathematical Symbols-B", 3],
    [new Interval(0x2A00, 0x2AFF), "Supplemental Mathematical Operators", 3],
    [new Interval(0x2B00, 0x2BFF), "Miscellaneous Symbols and Arrows", 3],
    [new Interval(0x2C00, 0x2C5F), "Glagolitic", 5],
    [new Interval(0x2C60, 0x2C7F), "Latin Extended-C", 20],
    [new Interval(0x2C80, 0x2CFF), "Coptic", 10],
    [new Interval(0x2D00, 0x2D2F), "Georgian Supplement", 20],
    [new Interval(0x2D30, 0x2D7F), "Tifinagh", 5],
    [new Interval(0x2D80, 0x2DDF), "Ethiopic Extended", 10],
    [new Interval(0x2DE0, 0x2DFF), "Cyrillic Extended-A", 20],
    [new Interval(0x2E00, 0x2E7F), "Supplemental Punctuation", 3],
    [new Interval(0x2E80, 0x2EFF), "CJK Radicals Supplement", 5],
    [new Interval(0x2F00, 0x2FDF), "Kangxi Radicals", 5],
    [new Interval(0x2FF0, 0x2FFF), "Ideographic Description Characters", 4],
    [new Interval(0x3000, 0x303F), "CJK Symbols and Punctuation", 5],
    [new Interval(0x3040, 0x309F), "Hiragana", 10],
    [new Interval(0x30A0, 0x30FF), "Katakana", 10],
    [new Interval(0x3100, 0x312F), "Bopomofo", 10],
    [new Interval(0x3130, 0x318F), "Hangul Compatibility Jamo", 5],
    [new Interval(0x3190, 0x319F), "Kanbun", 5],
    [new Interval(0x31A0, 0x31BF), "Bopomofo Extended", 5],
    [new Interval(0x31C0, 0x31EF), "CJK Strokes", 5],
    [new Interval(0x31F0, 0x31FF), "Katakana Phonetic Extensions", 4],
    [new Interval(0x3200, 0x32FF), "Enclosed CJK Letters and Months", 4],
    [new Interval(0x3300, 0x33FF), "CJK Compatibility", 5],
    [new Interval(0x3400, 0x4DBF), "CJK Unified Ideographs Extension A", 5],
    [new Interval(0x4DC0, 0x4DFF), "Yijing Hexagram Symbols", 5],
    [new Interval(0x4E00, 0x9FFF), "CJK Unified Ideographs", 5],
    [new Interval(0xA000, 0xA48F), "Yi Syllables", 5],
    [new Interval(0xA490, 0xA4CF), "Yi Radicals", 5],
    [new Interval(0xA4D0, 0xA4FF), "Lisu", 5],
    [new Interval(0xA500, 0xA63F), "Vai", 5],
    [new Interval(0xA640, 0xA69F), "Cyrillic Extended-B", 20],
    [new Interval(0xA6A0, 0xA6FF), "Bamum", 5],
    [new Interval(0xA700, 0xA71F), "Modifier Tone Letters", 4],
    [new Interval(0xA720, 0xA7FF), "Latin Extended-D", 20],
    [new Interval(0xA800, 0xA82F), "Syloti Nagri", 5],
    [new Interval(0xA830, 0xA83F), "Common Indic Number Forms", 5],
    [new Interval(0xA840, 0xA87F), "Phags-pa", 5],
    [new Interval(0xA880, 0xA8DF), "Saurashtra", 5],
    [new Interval(0xA8E0, 0xA8FF), "Devanagari Extended", 10],
    [new Interval(0xA900, 0xA92F), "Kayah Li", 5],
    [new Interval(0xA930, 0xA95F), "Rejang", 5],
    [new Interval(0xA960, 0xA97F), "Hangul Jamo Extended-A", 10],
    [new Interval(0xA980, 0xA9DF), "Javanese", 5],
    [new Interval(0xA9E0, 0xA9FF), "Myanmar Extended-B", 5],
    [new Interval(0xAA00, 0xAA5F), "Cham", 5],
    [new Interval(0xAA60, 0xAA7F), "Myanmar Extended-A", 10],
    [new Interval(0xAA80, 0xAADF), "Tai Viet", 10],
    [new Interval(0xAAE0, 0xAAFF), "Meetei Mayek Extensions", 5],
    [new Interval(0xAB00, 0xAB2F), "Ethiopic Extended-A", 10],
    [new Interval(0xAB30, 0xAB6F), "Latin Extended-E", 20],
    [new Interval(0xAB70, 0xABBF), "Cherokee Supplement", 5],
    [new Interval(0xABC0, 0xABFF), "Meetei Mayek", 5],
    [new Interval(0xAC00, 0xD7AF), "Hangul Syllables", 5],
    [new Interval(0xD7B0, 0xD7FF), "Hangul Jamo Extended-B", 5],
    [new Interval(0xD800, 0xDB7F), "High Surrogates", 0],
    [new Interval(0xDB80, 0xDBFF), "High Private Use Surrogates", 0],
    [new Interval(0xDC00, 0xDFFF), "Low Surrogates", 0],
    [new Interval(0xE000, 0xF8FF), "Private Use Area", 0],
    [new Interval(0xF900, 0xFAFF), "CJK Compatibility Ideographs", 5],
    [new Interval(0xFB00, 0xFB4F), "Alphabetic Presentation Forms", 3],
    [new Interval(0xFB50, 0xFDFF), "Arabic Presentation Forms-A", 5],
    [new Interval(0xFE00, 0xFE0F), "Variation Selectors", 4],
    [new Interval(0xFE10, 0xFE1F), "Vertical Forms", 3],
    [new Interval(0xFE20, 0xFE2F), "Combining Half Marks", 4],
    [new Interval(0xFE30, 0xFE4F), "CJK Compatibility Forms", 5],
    [new Interval(0xFE50, 0xFE6F), "Small Form Variants", 4],
    [new Interval(0xFE70, 0xFEFF), "Arabic Presentation Forms-B", 5],
    [new Interval(0xFF00, 0xFFEF), "Halfwidth and Fullwidth Forms", 5],
    [new Interval(0xFFF0, 0xFFFF), "Specials", 3],
    [new Interval(0x10000, 0x1007F), "Linear B Syllabary", 5],
    [new Interval(0x10080, 0x100FF), "Linear B Ideograms", 5],
    [new Interval(0x10100, 0x1013F), "Aegean Numbers", 4],
    [new Interval(0x10140, 0x1018F), "Ancient Greek Numbers", 4],
    [new Interval(0x10190, 0x101CF), "Ancient Symbols", 4],
    [new Interval(0x101D0, 0x101FF), "Phaistos Disc", 4],
    [new Interval(0x10280, 0x1029F), "Lycian", 4],
    [new Interval(0x102A0, 0x102DF), "Carian", 4],
    [new Interval(0x102E0, 0x102FF), "Coptic Epact Numbers", 3],
    [new Interval(0x10300, 0x1032F), "Old Italic", 3],
    [new Interval(0x10330, 0x1034F), "Gothic", 4],
    [new Interval(0x10350, 0x1037F), "Old Permic", 3],
    [new Interval(0x10380, 0x1039F), "Ugaritic", 4],
    [new Interval(0x103A0, 0x103DF), "Old Persian", 3],
    [new Interval(0x10400, 0x1044F), "Deseret", 4],
    [new Interval(0x10450, 0x1047F), "Shavian", 4],
    [new Interval(0x10480, 0x104AF), "Osmanya", 4],
    [new Interval(0x104B0, 0x104FF), "Osage", 4],
    [new Interval(0x10500, 0x1052F), "Elbasan", 4],
    [new Interval(0x10530, 0x1056F), "Caucasian Albanian", 4],
    [new Interval(0x10600, 0x1077F), "Linear A", 3],
    [new Interval(0x10800, 0x1083F), "Cypriot Syllabary", 5],
    [new Interval(0x10840, 0x1085F), "Imperial Aramaic", 4],
    [new Interval(0x10860, 0x1087F), "Palmyrene", 4],
    [new Interval(0x10880, 0x108AF), "Nabataean", 4],
    [new Interval(0x108E0, 0x108FF), "Hatran", 5],
    [new Interval(0x10900, 0x1091F), "Phoenician", 4],
    [new Interval(0x10920, 0x1093F), "Lydian", 4],
    [new Interval(0x10980, 0x1099F), "Meroitic Hieroglyphs", 3],
    [new Interval(0x109A0, 0x109FF), "Meroitic Cursive", 3],
    [new Interval(0x10A00, 0x10A5F), "Kharoshthi", 5],
    [new Interval(0x10A60, 0x10A7F), "Old South Arabian", 4],
    [new Interval(0x10A80, 0x10A9F), "Old North Arabian", 4],
    [new Interval(0x10AC0, 0x10AFF), "Manichaean", 5],
    [new Interval(0x10B00, 0x10B3F), "Avestan", 5],
    [new Interval(0x10B40, 0x10B5F), "Inscriptional Parthian", 4],
    [new Interval(0x10B60, 0x10B7F), "Inscriptional Pahlavi", 4],
    [new Interval(0x10B80, 0x10BAF), "Psalter Pahlavi", 5],
    [new Interval(0x10C00, 0x10C4F), "Old Turkic", 4],
    [new Interval(0x10C80, 0x10CFF), "Old Hungarian", 4],
    [new Interval(0x10E60, 0x10E7F), "Rumi Numeral Symbols", 4],
    [new Interval(0x11000, 0x1107F), "Brahmi", 5],
    [new Interval(0x11080, 0x110CF), "Kaithi", 5],
    [new Interval(0x110D0, 0x110FF), "Sora Sompeng", 5],
    [new Interval(0x11100, 0x1114F), "Chakma", 5],
    [new Interval(0x11150, 0x1117F), "Mahajani", 5],
    [new Interval(0x11180, 0x111DF), "Sharada", 5],
    [new Interval(0x111E0, 0x111FF), "Sinhala Archaic Numbers", 4],
    [new Interval(0x11200, 0x1124F), "Khojki", 5],
    [new Interval(0x11280, 0x112AF), "Multani", 5],
    [new Interval(0x112B0, 0x112FF), "Khudawadi", 5],
    [new Interval(0x11300, 0x1137F), "Grantha", 5],
    [new Interval(0x11400, 0x1147F), "Newa", 5],
    [new Interval(0x11480, 0x114DF), "Tirhuta", 5],
    [new Interval(0x11580, 0x115FF), "Siddham", 5],
    [new Interval(0x11600, 0x1165F), "Modi", 5],
    [new Interval(0x11660, 0x1167F), "Mongolian Supplement", 5],
    [new Interval(0x11680, 0x116CF), "Takri", 5],
    [new Interval(0x11700, 0x1173F), "Ahom", 5],
    [new Interval(0x118A0, 0x118FF), "Warang Citi", 5],
    [new Interval(0x11A00, 0x11A4F), "Zanabazar Square", 5],
    [new Interval(0x11A50, 0x11AAF), "Soyombo", 5],
    [new Interval(0x11AC0, 0x11AFF), "Pau Cin Hau", 5],
    [new Interval(0x11C00, 0x11C6F), "Bhaiksuki", 5],
    [new Interval(0x11C70, 0x11CBF), "Marchen", 5],
    [new Interval(0x11D00, 0x11D5F), "Masaram Gondi", 5],
    [new Interval(0x12000, 0x123FF), "Cuneiform", 5],
    [new Interval(0x12400, 0x1247F), "Cuneiform Numbers and Punctuation", 5],
    [new Interval(0x12480, 0x1254F), "Early Dynastic Cuneiform", 4],
    [new Interval(0x13000, 0x1342F), "Egyptian Hieroglyphs", 4],
    [new Interval(0x14400, 0x1467F), "Anatolian Hieroglyphs", 4],
    [new Interval(0x16800, 0x16A3F), "Bamum Supplement", 5],
    [new Interval(0x16A40, 0x16A6F), "Mro", 5],
    [new Interval(0x16AD0, 0x16AFF), "Bassa Vah", 5],
    [new Interval(0x16B00, 0x16B8F), "Pahawh Hmong", 5],
    [new Interval(0x16F00, 0x16F9F), "Miao", 5],
    [new Interval(0x16FE0, 0x16FFF), "Ideographic Symbols and Punctuation", 4],
    [new Interval(0x17000, 0x187FF), "Tangut", 5],
    [new Interval(0x18800, 0x18AFF), "Tangut Components", 5],
    [new Interval(0x1B000, 0x1B0FF), "Kana Supplement", 5],
    [new Interval(0x1B100, 0x1B12F), "Kana Extended-A", 5],
    [new Interval(0x1B170, 0x1B2FF), "Nushu", 5],
    [new Interval(0x1BC00, 0x1BC9F), "Duployan", 5],
    [new Interval(0x1BCA0, 0x1BCAF), "Shorthand Format Controls", 1],
    [new Interval(0x1D000, 0x1D0FF), "Byzantine Musical Symbols", 3],
    [new Interval(0x1D100, 0x1D1FF), "Musical Symbols", 3],
    [new Interval(0x1D200, 0x1D24F), "Ancient Greek Musical Notation", 3],
    [new Interval(0x1D300, 0x1D35F), "Tai Xuan Jing Symbols", 5],
    [new Interval(0x1D360, 0x1D37F), "Counting Rod Numerals", 2],
    [new Interval(0x1D400, 0x1D7FF), "Mathematical Alphanumeric Symbols", 5],
    [new Interval(0x1D800, 0x1DAAF), "Sutton SignWriting", 5],
    [new Interval(0x1E000, 0x1E02F), "Glagolitic Supplement", 5],
    [new Interval(0x1E800, 0x1E8DF), "Mende Kikakui", 5],
    [new Interval(0x1E900, 0x1E95F), "Adlam", 5],
    [new Interval(0x1EE00, 0x1EEFF), "Arabic Mathematical Alphabetic Symbols", 5],
    [new Interval(0x1F000, 0x1F02F), "Mahjong Tiles", 2],
    [new Interval(0x1F030, 0x1F09F), "Domino Tiles", 2],
    [new Interval(0x1F0A0, 0x1F0FF), "Playing Cards", 2],
    [new Interval(0x1F100, 0x1F1FF), "Enclosed Alphanumeric Supplement", 5],
    [new Interval(0x1F200, 0x1F2FF), "Enclosed Ideographic Supplement", 5],
    [new Interval(0x1F300, 0x1F5FF), "Miscellaneous Symbols and Pictographs", 2],
    [new Interval(0x1F600, 0x1F64F), "Emoticons (Emoji)", 2],
    [new Interval(0x1F650, 0x1F67F), "Ornamental Dingbats", 2],
    [new Interval(0x1F680, 0x1F6FF), "Transport and Map Symbols", 3],
    [new Interval(0x1F700, 0x1F77F), "Alchemical Symbols", 3],
    [new Interval(0x1F780, 0x1F7FF), "Geometric Shapes Extended", 3],
    [new Interval(0x1F800, 0x1F8FF), "Supplemental Arrows-C", 3],
    [new Interval(0x1F900, 0x1F9FF), "Supplemental Symbols and Pictographs", 5],
    [new Interval(0x20000, 0x2A6DF), "CJK Unified Ideographs Extension B", 5],
    [new Interval(0x2A700, 0x2B73F), "CJK Unified Ideographs Extension C", 5],
    [new Interval(0x2B740, 0x2B81F), "CJK Unified Ideographs Extension D", 5],
    [new Interval(0x2B820, 0x2CEAF), "CJK Unified Ideographs Extension E", 5],
    [new Interval(0x2CEB0, 0x2EBEF), "CJK Unified Ideographs Extension F", 5],
    [new Interval(0x2F800, 0x2FA1F), "CJK Compatibility Ideographs Supplement", 5],
    [new Interval(0xE0000, 0xE007F), "Tags", 1],
    [new Interval(0xE0100, 0xE01EF), "Variation Selectors Supplement", 1],
];

let predefinedWeightSum = 0;

/**
 * Converts the code points from the given file to an interval set.
 *
 * @param dataFile The name of a file to import.
 * @param existing Optionally specifies an interval set with previously red values (to merge with the new ones).
 *
 * @returns A new set of Unicode code points.
 */
const codePointsToIntervals = (dataFile: string, existing?: IntervalSet): IntervalSet => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
    const charsToExclude: number[] = require("@unicode/unicode-11.0.0/" + dataFile);
    const result = existing ?? new IntervalSet([]);

    // Code points are sorted in increasing order, which we can use to speed up insertion.
    let start = charsToExclude[0];
    let end = start;
    for (let i = 1; i < charsToExclude.length; ++i) {
        const code = charsToExclude[i];
        if (end + 1 === code) {
            ++end;
            continue;
        }

        result.add(start, end);
        start = code;
        end = code;
    }

    result.add(start, end);

    return result;
};

export const fullUnicodeSet = new IntervalSet([new Interval(0, 0x10FFFF)]);

export interface IUnicodeOptions {
    // The CJK scripts consist of so many code points, any generated random string will contain mostly CJK
    // characters (Chinese/Japanese/Korean), if not excluded. However, only the largest scripts are
    // removed by this setting, namely:
    //   - CJK Unified Ideographs (+ Extension A)
    //   - Yi Syllables
    //   - Hangul Syllables
    //   - CJK Compatibility Ideographs
    excludeCJK?: boolean;

    // Right-to-left characters don't fit well in the standard left-to-right direction, especially when
    // generated randomly, so allow excluding them as well.
    excludeRTL?: boolean;

    // Exclude any character beyond the basic multilingual pane (0x10000 and higher).
    limitToBMP?: boolean;

    // When set to true include all Unicode line terminators (LF, VT, FF, CR, NEL, LS, PS) as valid output.
    includeLineTerminators?: boolean;
}

/**
 * Creates an interval set with all printable Unicode characters.
 *
 * @param options Values that specify the Unicode set to create.
 *
 * @returns A set of intervals with the requested Unicode code points.
 */
export const printableUnicodePoints = (options: IUnicodeOptions): IntervalSet => {
    // Create a set with all Unicode code points that are assigned and not in categories with unprintable chars,
    // surrogate pairs, formatting + private codes.
    let intervalsToExclude = codePointsToIntervals("General_Category/Unassigned/code-points.js");
    intervalsToExclude = codePointsToIntervals("General_Category/Control/code-points.js", intervalsToExclude);
    intervalsToExclude = codePointsToIntervals("General_Category/Format/code-points.js", intervalsToExclude);
    intervalsToExclude = codePointsToIntervals("General_Category/Surrogate/code-points.js", intervalsToExclude);
    intervalsToExclude = codePointsToIntervals("General_Category/Private_Use/code-points.js", intervalsToExclude);

    if (options.excludeCJK) {
        intervalsToExclude = codePointsToIntervals("Block/CJK_Unified_Ideographs/code-points.js",
            intervalsToExclude);
        intervalsToExclude = codePointsToIntervals("Block/CJK_Unified_Ideographs_Extension_A/code-points.js",
            intervalsToExclude);
        intervalsToExclude = codePointsToIntervals("Block/CJK_Compatibility_Ideographs/code-points.js",
            intervalsToExclude);
        intervalsToExclude = codePointsToIntervals("Block/Hangul_Syllables/code-points.js", intervalsToExclude);
        intervalsToExclude = codePointsToIntervals("Block/Yi_Syllables/code-points.js", intervalsToExclude);
    }

    if (options.excludeRTL) {
        // Note: there are also a few top-to-bottom scripts (e.g. mongolian), but these are not considered here.
        intervalsToExclude = codePointsToIntervals("Bidi_Class/Right_To_Left/code-points.js", intervalsToExclude);
        intervalsToExclude = codePointsToIntervals("Bidi_Class/Right_To_Left_Embedding/code-points.js",
            intervalsToExclude);
        intervalsToExclude = codePointsToIntervals("Bidi_Class/Right_To_Left_Isolate/code-points.js",
            intervalsToExclude);
        intervalsToExclude = codePointsToIntervals("Bidi_Class/Right_To_Left_Override/code-points.js",
            intervalsToExclude);
    }

    if (options.includeLineTerminators) {
        // Unicode line terminators are implicitly taken out by the above code, so we add them in here.
        intervalsToExclude.remove(0x0A); // NL, New Line.
        intervalsToExclude.remove(0x0B); // VT, Vertical Tab
        intervalsToExclude.remove(0x0C); // FF, Form Feed
        intervalsToExclude.remove(0x0D); // CR, Carriage Return
        intervalsToExclude.remove(0x85); // NEL, Next Line
        intervalsToExclude.remove(0x2028); // LS, Line Separator
        intervalsToExclude.remove(0x2029); // PS, Paragraph Separator
    }

    let sourceIntervals: IntervalSet;
    if (options.limitToBMP) {
        sourceIntervals = IntervalSet.COMPLETE_CHAR_SET;
    } else {
        sourceIntervals = fullUnicodeSet;
    }

    return intervalsToExclude.complement(sourceIntervals);
};

/**
 * Returns a set of random Unicode code blocks, based on the predefined weights and the overrides given as parameter.
 *
 * @param blockOverrides Optionally contains name/value pairs to specify custom weights for code blocks.
 *
 * @returns An interval set containing the selected block intervals.
 */
export const randomCodeBlocks = (blockOverrides?: Map<string, number>): IntervalSet => {
    if (predefinedWeightSum === 0) {
        for (const entry of unicodeBlocks) {
            predefinedWeightSum += entry[2];
        }
    }

    let weightSum = 0;
    if (!blockOverrides) {
        weightSum = predefinedWeightSum;
    } else {
        for (const entry of unicodeBlocks) {
            if (blockOverrides.has(entry[1])) {
                weightSum += blockOverrides.get(entry[1])!;
            } else {
                weightSum += entry[2];
            }
        }
    }

    const set = new IntervalSet();

    for (let i = 0; i < 10; ++i) {
        let randomValue = Math.random() * weightSum;
        for (const entry of unicodeBlocks) {
            let weight = entry[2];
            if (blockOverrides && blockOverrides.has(entry[1])) {
                weight = blockOverrides.get(entry[1])!;
            }

            randomValue -= weight;
            if (randomValue < 0) {
                set.add(entry[0].a, entry[0].b);
            }
        }
    }

    return set;
};
