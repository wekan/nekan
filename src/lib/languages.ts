
// This file stores the language data for the application.
// The 'load' function was a placeholder and has been removed as actual i18n file loading is not implemented.

/* Languages:

English (en) source language
Afrikaans (af)
Afrikaans (South Africa) (af_ZA)
Arabic (ar)
Arabic (Algeria) (ar_DZ)
Arabic (Egypt) (ar_EG)
Armenian (hy)
Asturian (Spain) (ast_ES)
Azerbaijani (az)
Azerbaijani (Azerbaijan) (az_AZ)
Azerbaijani (Latin) (az@latin)
Basque (eu)
Breton (br)
Bulgarian (Bulgaria) (bg_BG)
Cantonese (China) (yue_CN)
Catalan (ca)
Catalan (Spain) (ca_ES)
Catalan (Valencian) (ca@valencia)
Chinese (zh)
Chinese (China) (zh_CN)
Chinese (China) (GB2312) (zh_CN.GB2312)
Chinese (Hong Kong) (zh_HK)
Chinese (Mandarin) (cmn)
Chinese (Taiwan) (zh_TW)
Chinese Simplified (zh-Hans)
Chinese Simplified (Wu) (wuu-Hans)
Chinese Traditional (zh-Hant)
Croatian (hr)
Czech (cs)
Czech (Czech Republic) (cs_CZ)
Danish (da)
Dutch (nl)
Dutch (Netherlands) (nl_NL)
English (Brazil) (en_BR)
English (Germany) (en_DE)
English (Indonesia) (en_ID)
English (Italy) (en_IT)
English (Malaysia) (en_MY)
English (Singapore) (en_SG)
English (South Africa) (en_ZA)
English (Turkey) (en_TR)
English (United Kingdom) (en_GB)
Esperanto (eo)
Estonian (Estonia) (et_EE)
Finnish (Finland) (fi_FI)
French (fr)
French (France) (fr_FR)
French (Switzerland) (fr_CH)
Galician (gl)
Galician (Spain) (gl_ES)
Georgian (ka)
German (de)
German (Austria) (de_AT)
German (Germany) (de_DE)
German (Switzerland) (de_CH)
Greek (el)
Greek (Greece) (el_GR)
Gujarati (India) (gu_IN)
Hebrew (he)
Hebrew (Israel) (he_IL)
Hindi (hi)
Hindi (India) (hi_IN)
Hungarian (Hungary) (hu_HU)
Igbo (ig)
Indonesian (Indonesia) (id_ID)
Italian (it)
Japanese (ja)
Japanese (Hiragana) (ja-Hira)
Japanese (Japan) (ja_JP)
Khmer (km)
Klingon (tlh)
Korean (ko)
Korean (Korea) (ko_KR)
Latvian (Latvia) (lv_LV)
Lithuanian (lt)
Macedonian (mk)
Malay (ms)
Malay (Malaysia) (ms_MY)
Mongolian (Mongolia) (mn_MN)
Moroccan Arabic (ary)
Norwegian Bokmål (nb)
Occitan (post 1500) (oc)
Odia (India) (or_IN)
Panjabi (Punjabi) (pa)
Persian (fa)
Persian (Iran) (fa_IR)
Polish (pl)
Polish (Poland) (pl_PL)
Portuguese (pt)
Portuguese (Brazil) (pt_BR)
Portuguese (Portugal) (pt_PT)
Romanian (ro)
Romanian (Romania) (ro_RO)
Russian (ru)
Russian (Ukraine) (ru_UA)
Serbian (sr)
Slovak (sk)
Slovenian (Slovenia) (sl_SI)
Spanish (es)
Spanish (Argentina) (es_AR)
Spanish (Chile) (es_CL)
Spanish (Colombia) (es_CO)
Spanish (Latin America) (es_419)
Spanish (Mexico) (es_MX)
Spanish (Paraguay) (es_PY)
Spanish (Peru) (es_PE)
Standard Moroccan Tamazight (zgh)
Swahili (sw)
Swedish (sv)
Tamil (ta)
Telugu (India) (te_IN)
Thai (th)
Turkish (tr)
Turkmen (Turkmenistan) (tk_TM) no translators
Ukrainian (uk)
Ukrainian (Ukraine) (uk_UA)
Uyghur (ug)
Uzbek (uz)
Uzbek (Arabic) (uz@Arab)
Uzbek (Latin) (uz@Latn)
Uzbek (Uzbekistan) (uz_UZ)
Venda (ve)
Venetian (vec)
Vepsian (vep)
Vietnamese (vi)
Vietnamese (Viet Nam) (vi_VN)
Vlaams (vls)
Volapük (vo)
Walloon (wa)
Welsh (cy)
Welsh (United Kingdom) (cy_GB)
Western Frisian (fy)
Western Frisian (Netherlands) (fy_NL)
Wolof (wo)
Wáray-Wáray (war)
Xhosa (xh)
Yeshivish English (en@ysv)
Yiddish (yi)
Yoruba (yo)
Zulu (zu)
Zulu (South Africa) (zu_ZA)

*/

export interface Language {
  code: string;
  tag: string;
  name: string;
  rtl?: string; // "true" or "false"
}

export interface LanguagesData {
  [key: string]: Language;
}

export const languagesData: LanguagesData = {
  "af": {
    code: "af",
    tag: "af",
    name: "Afrikaans",
    rtl: "false",
  },
  "af_ZA": {
    code: "af",
    tag: "af_ZA",
    name: "Afrikaans (South Africa)",
    rtl: "false",
  },
  "en_ZA": {
    code: "en",
    tag: "en_ZA",
    name: "English (South Africa)",
    rtl: "false",
  },
  "ar-DZ": {
    code: "ar",
    tag: "ar-DZ",
    name: "دزيرية",
    rtl: "true",
  },
  "ar-EG": {
    code: "ar",
    tag: "ar-EG",
    name: "مَصرى",
    rtl: "true",
  },
  "ar": {
    code: "ar",
    tag: "ar",
    name: "العربية",
    rtl: "true",
  },
  "ary": {
    code: "ary",
    tag: "ary",
    name: "عربي مغربي",
    rtl: "true",
  },
  "az-AZ": {
    code: "az",
    tag: "az-AZ",
    name: "Azərbaycan (Azərbaycan)",
  },
  "az-LA": {
    code: "az",
    tag: "az-LA",
    name: "Azərbaycan (Latin)",
  },
  "az": {
    code: "az",
    tag: "az",
    name: "Azərbaycan",
  },
  "bg": {
    code: "bg",
    tag: "bg",
    name: "Български",
  },
  "br": {
    code: "br",
    tag: "br",
    name: "Brezhoneg",
  },
  "ca": {
    code: "ca",
    tag: "ca",
    name: "català",
  },
  "ca-ES": {
    code: "ca",
    tag: "ca-ES",
    name: "català (Espanya)",
  },
  "cmn": {
    code: "cn",
    tag: "cnm",
    name: "官話 / 官话",
  },
  "cs": {
    code: "cs",
    tag: "cs",
    name: "čeština",
  },
  "cs-CZ": {
    code: "cs",
    tag: "cs-CZ",
    name: "čeština (Česká republika)",
  },
  "cy-GB": {
    code: "cy",
    tag: "cy-GB",
    name: "Welsh (UK)",
  },
  "cy": {
    code: "cy",
    tag: "cy",
    name: "Welsh",
  },
  "da": {
    code: "da",
    tag: "da",
    name: "Dansk",
  },
  "de-AT": {
    code: "de",
    tag: "de-AT",
    name: "Deutsch (Österreich)",
  },
  "de-CH": {
    code: "de",
    tag: "de-CH",
    name: "Deutsch (Schweiz)",
  },
  "de-DE": {
    code: "de",
    tag: "de-DE",
    name: "Deutsch (Deutschland)",
  },
  "de": {
    code: "de",
    tag: "de",
    name: "Deutsch",
  },
  "el-GR": {
    code: "el",
    tag: "el-GR",
    name: "Ελληνικά (Ελλάδα)",
  },
  "el": {
    code: "el",
    tag: "el",
    name: "Ελληνικά",
  },
  "en-BR": {
    code: "en",
    tag: "en-BR",
    name: "English (Brazil)",
  },
  "en-DE": {
    code: "en",
    tag: "en-DE",
    name: "English (Germany)",
  },
  "en-GB": {
    code: "en",
    tag: "en-GB",
    name: "English (UK)",
  },
  "en-IT": {
    code: "en",
    tag: "en-IT",
    name: "English (Italy)",
  },
  "en-MY": {
    code: "en",
    tag: "en-MY",
    name: "English (Malaysia)",
  },
  "en-YS": {
    code: "en",
    tag: "en-YS",
    name: "English (Yeshivish)",
  },
  "en": {
    code: "en",
    tag: "en",
    name: "English",
  },
  "eo": {
    code: "eo",
    tag: "eo",
    name: "Esperanto",
  },
  "ast-ES": {
    code: "es",
    tag: "ast-ES",
    name: "español de Asturias",
  },
  "es-AR": {
    code: "es",
    tag: "es-AR",
    name: "español de Argentina",
  },
  "es-CL": {
    code: "es",
    tag: "es-CL",
    name: "español de Chile",
  },
  "es-CO": {
    code: "es",
    tag: "es-CO",
    name: "español en Colombia",
  },
  "es-LA": {
    code: "es",
    tag: "es-LA",
    name: "español de América Latina",
  },
  "es-MX": {
    code: "es",
    tag: "es-MX",
    name: "español de México",
  },
  "es-PE": {
    code: "es",
    tag: "es-PE",
    name: "español de Perú",
  },
  "es-PY": {
    code: "es",
    tag: "es-PY",
    name: "español de Paraguayo",
  },
  "es": {
    code: "es",
    tag: "es",
    name: "español",
  },
  "et-EE": {
    code: "et",
    tag: "et-EE",
    name: "eesti keel (Eesti)",
  },
  "eu": {
    code: "eu",
    tag: "eu",
    name: "Euskara",
  },
  "fa-IR": {
    code: "fa",
    tag: "fa-IR",
    name: "فارسی/پارسی (ایران\u200e)",
    rtl: "true",
  },
  "fa": {
    code: "fa",
    tag: "fa",
    name: "فارسی",
    rtl: "true",
  },
  "fi": {
    code: "fi",
    tag: "fi",
    name: "Suomi",
  },
  "fr-BE": {
    code: "fr",
    tag: "fr-BE",
    name: "Français (Belgique)",
  },
  "fr-CA": {
    code: "fr",
    tag: "fr-CA",
    name: "Français (Canada)",
  },
  "fr-CH": {
    code: "fr",
    tag: "fr-CH",
    name: "Français (Schweiz)",
  },
  "fr": {
    code: "fr",
    tag: "fr",
    name: "Français",
  },
  "fy-NL": {
    code: "fy",
    tag: "fy-NL",
    name: "Westerlauwersk Frysk (Nederlân)",
  },
  "fy": {
    code: "fy",
    tag: "fy",
    name: "Westerlauwersk Frysk",
  },
  "gl-ES": {
    code: "gl",
    tag: "gl-ES",
    name: "Galego (España)",
  },
  "gl": {
    code: "gl",
    tag: "gl",
    name: "Galego",
  },
  "gu-IN": {
    code: "gu",
    tag: "gu-IN",
    name: "ગુજરાતી",
  },
  "he-IL": {
    code: "he",
    tag: "he-IL",
    name: "עברית (ישראל)",
    rtl: "true",
  },
  "he": {
    code: "he",
    tag: "he",
    name: "עברית",
    rtl: "true",
  },
  "hi-IN": {
    code: "hi",
    tag: "hi-IN",
    name: "हिंदी (भारत)",
  },
  "hi": {
    code: "hi",
    tag: "hi",
    name: "हिन्दी",
  },
  "hr": {
    code: "hr",
    tag: "hr",
    name: "Hrvatski",
  },
  "hu": {
    code: "hu",
    tag: "hu",
    name: "Magyar",
  },
  "hy": {
    code: "hy",
    tag: "hy",
    name: "Հայերեն",
  },
  "id": {
    code: "id",
    tag: "id",
    name: "Bahasa Indonesia",
  },
  "ig": {
    code: "ig",
    tag: "ig",
    name: "Igbo",
  },
  "it": {
    code: "it",
    tag: "it",
    name: "Italiano",
  },
  "ja": {
    code: "ja",
    tag: "ja",
    name: "日本語",
  },
  "ja-Hira": {
    code: "ja",
    tag: "ja-Hira",
    name: "平仮名",
  },
  "ja-JP": {
    code: "ja",
    tag: "ja-JP",
    name: "日本語（日本）",
  },
  "ka": {
    code: "ka",
    tag: "ka",
    name: "ქართული",
  },
  "km": {
    code: "km",
    tag: "km",
    name: "ភាសាខ្មែរ",
  },
  "ko-KR": {
    code: "ko",
    tag: "ko-KR",
    name: "한국어(한국)",
  },
  "ko": {
    code: "ko",
    tag: "ko",
    name: "한국어",
  },
  "lt": {
    code: "lt",
    tag: "lt",
    name: "Lietuvių kalba",
  },
  "lv": {
    code: "lv",
    tag: "lv",
    name: "latviešu valoda",
  },
  "mk": {
    code: "mk",
    tag: "mk",
    name: "македонски јазик",
  },
  "mn": {
    code: "mn",
    tag: "mn",
    name: "Монгол",
  },
  "ms": {
    code: "ms",
    tag: "ms",
    name: "بهاس ملايو",
  },
  "ms-MY": {
    code: "ms",
    tag: "ms-MY",
    name: "بهاس ملايو (Malaysia)",
  },
  "nb": {
    code: "nb",
    tag: "nb",
    name: "Norsk bokmål",
  },
  "nl-NL": {
    code: "nl",
    tag: "nl-NL",
    name: "Nederlands (Nederland)",
  },
  "nl": {
    code: "nl",
    tag: "nl",
    name: "Nederlands",
  },
  "oc": {
    code: "oc",
    tag: "oc",
    name: "Occitan",
  },
  "or-IN": {
    code: "or",
    tag: "or-IN",
    name: "ଓଡିଆ (ଭାରତ)",
  },
  "pa": {
    code: "pa",
    tag: "pa",
    name: "ਪੰਜਾਬੀ",
  },
  "pl-PL": {
    code: "pl",
    tag: "pl-PL",
    name: "Polski (Polska)",
  },
  "pl": {
    code: "pl",
    tag: "pl",
    name: "Polski",
  },
  "pt-BR": {
    code: "pt",
    tag: "pt-BR",
    name: "Português do Brasil",
  },
  "pt": {
    code: "pt",
    tag: "pt",
    name: "Português",
  },
  "pt-PT": {
    code: "pt",
    tag: "pt-PT",
    name: "Português de Portugal",
  },
  "ro": {
    code: "ro",
    tag: "ro",
    name: "Română",
  },
  "ro-RO": {
    code: "ro",
    tag: "ro-RO",
    name: "Română (România)",
  },
  "ru": {
    code: "ru",
    tag: "ru",
    name: "Русский",
  },
  "sk": {
    code: "sk",
    tag: "sk",
    name: "Slovenčina",
  },
  "sl": {
    code: "sl",
    tag: "sl",
    name: "slovenščina",
  },
  "sr": {
    code: "sr",
    tag: "sr",
    name: "Српски језик",
  },
  "sv": {
    code: "sv",
    tag: "sv",
    name: "Svenska",
  },
  "sw": {
    code: "sw",
    tag: "sw",
    name: "Kiswahili",
  },
  "ta": {
    code: "ta",
    tag: "ta",
    name: "தமிழ்",
  },
  "te-IN": {
    code: "te",
    tag: "te_IN",
    name: "తెలుగు (భారతదేశం)",
  },
  "th": {
    code: "th",
    tag: "th",
    name: "ไทย",
  },
  "tlh": {
    code: "tlh",
    tag: "tlh",
    name: "tlhIngan Hol",
  },
  "tr": {
    code: "tr",
    tag: "tr",
    name: "Türkçe",
  },
  "ug": {
    code: "ug",
    tag: "ug",
    name: "ئۇيغۇر تىلى",
  },
  "uk": {
    code: "uk",
    tag: "uk",
    name: "українська мова",
  },
  "uk-UA": {
    code: "uk",
    tag: "uk-UA",
    name: "Українська (Україна)",
  },
  "uz-AR": {
    code: "uz",
    tag: "uz-AR",
    name: "o'zbek (arab)",
  },
  "uz-LA": {
    code: "uz",
    tag: "uz-LA",
    name: "o'zbek (lotin)",
  },
  "uz-UZ": {
    code: "uz",
    tag: "uz-UZ",
    name: "o'zbek (O'zbekiston)",
  },
  "uz": {
    code: "uz",
    tag: "uz",
    name: "o'zbek",
  },
  "ve-CC": {
    code: "ve",
    tag: "ve-CC",
    name: "vèneto",
  },
  "ve-PP": {
    code: "ve",
    tag: "ve-PP",
    name: "vepsän kelʹ",
  },
  "ve": {
    code: "ve",
    tag: "ve",
    name: "Tshivenḓa",
  },
  "vi-VN": {
    code: "vi",
    tag: "vi-VN",
    name: "Tiếng Việt (Việt Nam)",
  },
  "vi": {
    code: "vi",
    tag: "vi",
    name: "Tiếng Việt",
  },
  "vl-SS": {
    code: "vl",
    tag: "vl-SS",
    name: "Vlaams",
  },
  "vo": {
    code: "vo",
    tag: "vo",
    name: "Volapük",
  },
  "wa-RR": {
    code: "wa",
    tag: "wa-RR",
    name: "Wáray-Wáray",
  },
  "wa": {
    code: "wa",
    tag: "wa",
    name: "walon",
  },
  "wo": {
    code: "wo",
    tag: "wo",
    name: "ولوفل",
  },
  "xh": {
    code: "xh",
    tag: "xh",
    name: "isiXhosa",
  },
  "yi": {
    code: "yi",
    tag: "yi",
    name: "ייִדיש, יידיש",
  },
  "yo": {
    code: "yo",
    tag: "yo",
    name: "Èdè Yorùbá",
  },
  "zgh": {
    code: "zgh",
    tag: "zgh",
    name: "ⵜⴰⵎⴰⵣⵉⵖⵜ ⵜⴰⵏⴰⵡⴰⵢⵜ",
  },
  "yue_CN": {
    code: "yue",
    tag: "yue_CN",
    name: "廣東話",
  },
  "zh-CN": {
    code: "zh",
    tag: "zh-CN",
    name: "简体中文",
  },
  "zh-GB": {
    code: "zh",
    tag: "zh-GB",
    name: "简体中文 GB2312",
  },
  "zh-Hans": {
    code: "zh",
    tag: "zh-Hans",
    name: "简化字",
  },
  "zh-Hant": {
    code: "zh",
    tag: "zh-Hant",
    name: "正體字",
  },
  "zh-HK": {
    code: "zh",
    tag: "zh-HK",
    name: "繁体中文（香港）",
  },
  "zh-TW": {
    code: "zh",
    tag: "zh-TW",
    name: "繁體中文（台灣）",
  },
  "zu-ZA": {
    code: "zu",
    tag: "zu-ZA",
    name: "isiZulu (Ningizimu Afrika)",
  },
  "zu": {
    code: "zu",
    tag: "zu",
    name: "isiZulu",
  }
};
