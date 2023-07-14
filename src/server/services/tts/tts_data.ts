import { MappedGroupDictionary } from "@/types";

export const azureVoices: MappedGroupDictionary<{
  styles?: string[],
  roles?: string[]
}> = {
  "Arabic (Egypt)": [
    ["ar-EG-SalmaNeural", "SalmaNeural"],
    ["ar-EG-ShakirNeural", "ShakirNeural"]
  ],
  "Arabic (Saudi Arabia)": [
    ["ar-SA-ZariyahNeural", "ZariyahNeural"],
    ["ar-SA-HamedNeural", "HamedNeural"]
  ],
  "Bulgarian (Bulgaria)": [
    ["bg-BG-KalinaNeural", "KalinaNeural"],
    ["bg-BG-BorislavNeural", "BorislavNeural"]
  ],
  "Catalan (Spain)": [
    ["ca-ES-AlbaNeural", "AlbaNeural"],
    ["ca-ES-JoanaNeural", "JoanaNeural"],
    ["ca-ES-EnricNeural", "EnricNeural"]
  ],
  "Chinese (Cantonese, Traditional)": [
    ["zh-HK-HiuGaaiNeural", "HiuGaaiNeural"],
    ["zh-HK-HiuMaanNeural", "HiuMaanNeural"],
    ["zh-HK-WanLungNeural", "WanLungNeural"]
  ],
  "Chinese (Mandarin, Simplified)": [
    ["zh-CN-XiaoxiaoNeural", "XiaoxiaoNeural", {styles: ["assistant", "chat", "customerservice", "newscast", "affectionate", "angry", "calm", "cheerful", "disgruntled", "fearful", "gentle", "lyrical", "sad", "serious", "poetry-reading"]}],
    ["zh-CN-XiaoyouNeural", "XiaoyouNeural"],
    ["zh-CN-XiaomoNeural", "XiaomoNeural", {styles: ["embarrassed", "calm", "fearful", "cheerful", "disgruntled", "serious", "angry", "sad", "depressed", "affectionate", "gentle", "envious"], roles: ["YoungAdultFemale", "YoungAdultMale", "OlderAdultFemale", "OlderAdultMale", "SeniorFemale", "SeniorMale", "Girl", "Boy"]}],
    ["zh-CN-XiaoxuanNeural", "XiaoxuanNeural", {styles: ["calm", "fearful", "cheerful", "disgruntled", "serious", "angry", "gentle", "depressed"], roles: ["YoungAdultFemale", "YoungAdultMale", "OlderAdultFemale", "OlderAdultMale", "SeniorFemale", "SeniorMale", "Girl", "Boy"]}],
    ["zh-CN-XiaohanNeural", "XiaohanNeural", {styles: ["calm", "fearful", "cheerful", "disgruntled", "serious", "angry", "sad", "gentle", "affectionate", "embarrassed"]}],
    ["zh-CN-XiaomengNeural", "XiaomengNeural", {styles: ["chat"]}],
    ["zh-CN-XiaoruiNeural", "XiaoruiNeural", {styles: ["calm", "fearful", "angry", "sad"]}],
    ["zh-CN-XiaoshuangNeural", "XiaoshuangNeural", {styles: ["chat"]}],
    ["zh-CN-XiaoyiNeural,", "XiaoyiNeural,", {styles: ["angry", "disgruntled", "affectionate", "cheerful", "fearful", "sad", "embarrassed", "serious", "gentle"]}],
    ["zh-CN-XiaozhenNeural,", "XiaozhenNeural,", {styles: ["angry", "disgruntled", "affectionate", "cheerful", "fearful", "sad", "embarrassed", "serious", "gentle"]}],
    ["zh-CN-YunfengNeural,", "YunfengNeural,", {styles: ["angry", "disgruntled", "cheerful", "fearful", "sad", "serious", "depressed"]}],
    ["zh-CN-YunjianNeural,", "YunjianNeural,", {styles: ["narration-relaxed", "sports-commentary", "sports-commentary-excited"]}],
    ["zh-CN-YunhaoNeural,", "YunhaoNeural,", {styles: ["advertisement-upbeat"]}],
    ["zh-CN-YunxiaNeural,", "YunxiaNeural,", {styles: ["calm", "fearful", "cheerful", "angry", "sad"]}],
    ["zh-CN-YunyangNeural", "YunyangNeural", {styles: ["customerservice", "narration-professional", "newscast-casual"]}],
    ["zh-CN-YunzeNeural", "YunzeNeural", {styles: ["calm", "fearful", "cheerful", "disgruntled", "serious", "angry", "sad", "depressed", "documentary-narration"], roles: ["OlderAdultMale", "SeniorMale"]}],
    ["zh-CN-YunyeNeural", "YunyeNeural", {styles: ["embarrassed", "calm", "fearful", "cheerful", "disgruntled", "serious", "angry", "sad"], roles: ["YoungAdultFemale, YoungAdultMale, OlderAdultFemale, OlderAdultMale, SeniorFemale, SeniorMale, Girl, Boy"]}],
    ["zh-CN-YunxiNeural", "YunxiNeural", {styles: ["narration-relaxed", "embarrassed", "fearful", "cheerful", "disgruntled", "serious", "angry", "sad", "depressed", "chat", "assistant", "newscast"], roles: ["Narrator", "YoungAdultMale", "Boy"]}],
  ],
  "Chinese (Taiwanese Mandarin)": [
    ["zh-TW-HsiaoChenNeural", "HsiaoChenNeural"],
    ["zh-TW-HsiaoYuNeural", "HsiaoYuNeural"],
    ["zh-TW-YunJheNeural", "YunJheNeural"]
  ],
  "Croatian (Croatia)": [
    ["hr-HR-GabrijelaNeural", "GabrijelaNeural"],
    ["hr-HR-SreckoNeural", "SreckoNeural"]
  ],
  "Czech (Czech)": [
    ["cs-CZ-VlastaNeural", "VlastaNeural"],
    ["cs-CZ-AntoninNeural", "AntoninNeural"]
  ],
  "Danish (Denmark)": [
    ["da-DK-ChristelNeural", "ChristelNeural"],
    ["da-DK-JeppeNeural", "JeppeNeural"]
  ],
  "Dutch (Belgium)": [
    ["nl-BE-DenaNeural", "DenaNeural"],
    ["nl-BE-ArnaudNeural", "ArnaudNeural"]
  ],
  "Dutch (Netherlands)": [
    ["nl-NL-ColetteNeural", "ColetteNeural"],
    ["nl-NL-FennaNeural", "FennaNeural"],
    ["nl-NL-MaartenNeural", "MaartenNeural"]
  ],
  "English (Australia)": [
    ["en-AU-NatashaNeural", "NatashaNeural"],
    ["en-AU-WilliamNeural", "WilliamNeural"]
  ],
  "English (Canada)": [
    ["en-CA-ClaraNeural", "ClaraNeural"],
    ["en-CA-LiamNeural", "LiamNeural"]
  ],
  "English (Hongkong)": [
    ["en-HK-YanNeural", "YanNeural"],
    ["en-HK-SamNeural", "SamNeural"]
  ],
  "English (India)": [
    ["en-IN-NeerjaNeural", "NeerjaNeural"],
    ["en-IN-PrabhatNeural", "PrabhatNeural"]
  ],
  "English (Ireland)": [
    ["en-IE-EmilyNeural", "EmilyNeural"],
    ["en-IE-ConnorNeural", "ConnorNeural"]
  ],
  "English (New Zealand)": [
    ["en-NZ-MollyNeural", "MollyNeural"],
    ["en-NZ-MitchellNeural", "MitchellNeural"]
  ],
  "English (Philippines)": [
    ["en-PH-RosaNeural", "RosaNeural"],
    ["en-PH-JamesNeural", "JamesNeural"]
  ],
  "English (Singapore)": [
    ["en-SG-LunaNeural", "LunaNeural"],
    ["en-SG-WayneNeural", "WayneNeural"]
  ],
  "English (South Africa)": [
    ["en-ZA-LeahNeural", "LeahNeural"],
    ["en-ZA-LukeNeural", "LukeNeural"]
  ],
  "English (United Kingdom)": [
    ["en-GB-LibbyNeural", "LibbyNeural"],
    ["en-GB-MiaNeural", "MiaNeural"],
    ["en-GB-RyanNeural", "RyanNeural", {styles: ["cheerful", "chat"]}],
    ["en-GB-SoniaNeural", "SoniaNeural", {styles: ["cheerful", "sad"]}],
  ],
  "English (United States)": [
    ["en-US-AriaNeural", "AriaNeural", {styles: ["chat", "customerservice", "narration-professional", "newscast-casual", "newscast-formal", "cheerful", "empathetic", "angry", "sad", "excited", "friendly", "terrified", "shouting", "unfriendly", "whispering", "hopeful"]}],
    ["en-US-DavisNeural", "DavisNeural", {styles: ["chat", "angry", "cheerful", "excited", "friendly", "hopeful", "sad", "shouting", "terrified", "unfriendly", "whispering"]}],
    ["en-US-GuyNeural", "GuyNeural", {styles: ["newscast", "angry", "cheerful", "sad", "excited", "friendly", "terrified", "shouting", "unfriendly", "whispering", "hopeful"]}],
    ["en-US-JaneNeural", "JaneNeural", {styles: ["angry", "cheerful", "excited", "friendly", "hopeful", "sad", "shouting", "terrified", "unfriendly", "whispering"]}],
    ["en-US-JasonNeural", "JasonNeural", {styles: ["angry", "cheerful", "excited", "friendly", "hopeful", "sad", "shouting", "terrified", "unfriendly", "whispering"]}],
    ["en-US-JennyNeural", "JennyNeural", {styles: ["assistant", "chat", "customerservice", "newscast", "angry", "cheerful", "sad", "excited", "friendly", "terrified", "shouting", "unfriendly", "whispering", "hopeful"]}],
    ["en-US-NancyNeural", "NancyNeural", {styles: ["angry", "cheerful", "excited", "friendly", "hopeful", "sad", "shouting", "terrified", "unfriendly", "whispering"]}],
    ["en-US-SaraNeural", "SaraNeural", {styles: ["angry", "cheerful", "excited", "friendly", "hopeful", "sad", "shouting", "terrified", "unfriendly", "whispering"]}],
    ["en-US-TonyNeural", "TonyNeural", {styles: ["angry", "cheerful", "excited", "friendly", "hopeful", "sad", "shouting", "terrified", "unfriendly", "whispering"]}],
  ],
  "Estonian (Estonia)": [
    ["et-EE-AnuNeural", "AnuNeural"],
    ["et-EE-KertNeural", "KertNeural"]
  ],
  "Finnish (Finland)": [
    ["fi-FI-NooraNeural", "NooraNeural"],
    ["fi-FI-SelmaNeural", "SelmaNeural"],
    ["fi-FI-HarriNeural", "HarriNeural"]
  ],
  "French (Belgium)": [
    ["fr-BE-CharlineNeural", "CharlineNeural"],
    ["fr-BE-GerardNeural", "GerardNeural"]
  ],
  "French (Canada)": [
    ["fr-CA-SylvieNeural", "SylvieNeural"],
    ["fr-CA-AntoineNeural", "AntoineNeural"],
    ["fr-CA-JeanNeural", "JeanNeural"]
  ],
  "French (France)": [
    ["fr-FR-DeniseNeural", "DeniseNeural", {styles: ["cheerful", "sad"]}],
    ["fr-FR-HenriNeural", "HenriNeural", {styles: ["cheerful", "sad"]}]
  ],
  "French (Switzerland)": [
    ["fr-CH-ArianeNeural", "ArianeNeural"],
    ["fr-CH-FabriceNeural", "FabriceNeural"]
  ],
  "German (Austria)": [
    ["de-AT-IngridNeural", "IngridNeural"],
    ["de-AT-JonasNeural", "JonasNeural"]
  ],
  "German (Germany)": [
    ["de-DE-KatjaNeural", "KatjaNeural"],
    ["de-DE-ConradNeural", "ConradNeural"]
  ],
  "German (Switzerland)": [
    ["de-CH-LeniNeural", "LeniNeural"],
    ["de-CH-JanNeural", "JanNeural"]
  ],
  "Greek (Greece)": [
    ["el-GR-AthinaNeural", "AthinaNeural"],
    ["el-GR-NestorasNeural", "NestorasNeural"]
  ],
  "Gujarati (India)": [
    ["gu-IN-DhwaniNeural", "DhwaniNeural"],
    ["gu-IN-NiranjanNeural", "NiranjanNeural"]
  ],
  "Hebrew (Israel)": [
    ["he-IL-HilaNeural", "HilaNeural"],
    ["he-IL-AvriNeural", "AvriNeural"]
  ],
  "Hindi (India)": [
    ["hi-IN-SwaraNeural", "SwaraNeural"],
    ["hi-IN-MadhurNeural", "MadhurNeural"]
  ],
  "Hungarian (Hungary)": [
    ["hu-HU-NoemiNeural", "NoemiNeural"],
    ["hu-HU-TamasNeural", "TamasNeural"]
  ],
  "Indonesian (Indonesia)": [
    ["id-ID-GadisNeural", "GadisNeural"],
    ["id-ID-ArdiNeural", "ArdiNeural"]
  ],
  "Irish (Ireland)": [
    ["ga-IE-OrlaNeural", "OrlaNeural"],
    ["ga-IE-ColmNeural", "ColmNeural"]
  ],
  "Italian (Italy)": [
    ["it-IT-ElsaNeural", "ElsaNeural"],
    ["it-IT-IsabellaNeural", "IsabellaNeural", {styles: ["cheerful","chat"]}],
    ["it-IT-DiegoNeural", "DiegoNeural"]
  ],
  "Japanese (Japan)": [
    ["ja-JP-NanamiNeural", "NanamiNeural", {styles: ["cheerful", "chat", "customerservice"]}],
    ["ja-JP-KeitaNeural", "KeitaNeural"]
  ],
  "Korean (Korea)": [
    ["ko-KR-SunHiNeural", "SunHiNeural"],
    ["ko-KR-InJoonNeural", "InJoonNeural"]
  ],
  "Latvian (Latvia)": [
    ["lv-LV-EveritaNeural", "EveritaNeural"],
    ["lv-LV-NilsNeural", "NilsNeural"]
  ],
  "Lithuanian (Lithuania)": [
    ["lt-LT-OnaNeural", "OnaNeural"],
    ["lt-LT-LeonasNeural", "LeonasNeural"]
  ],
  "Malay (Malaysia)": [
    ["ms-MY-YasminNeural", "YasminNeural"],
    ["ms-MY-OsmanNeural", "OsmanNeural"]
  ],
  "Maltese (Malta)": [
    ["mt-MT-GraceNeural", "GraceNeural"],
    ["mt-MT-JosephNeural", "JosephNeural"]
  ],
  "Marathi (India)": [
    ["mr-IN-AarohiNeural", "AarohiNeural"],
    ["mr-IN-ManoharNeural", "ManoharNeural"]
  ],
  "Norwegian (Bokmål, Norway)": [
    ["nb-NO-IselinNeural", "IselinNeural"],
    ["nb-NO-PernilleNeural", "PernilleNeural"],
    ["nb-NO-FinnNeural", "FinnNeural"]
  ],
  "Polish (Poland)": [
    ["pl-PL-AgnieszkaNeural", "AgnieszkaNeural"],
    ["pl-PL-ZofiaNeural", "ZofiaNeural"],
    ["pl-PL-MarekNeural", "MarekNeural"]
  ],
  "Portuguese (Brazil)": [
    ["pt-BR-FranciscaNeural", "FranciscaNeural"],
    ["pt-BR-AntonioNeural", "AntonioNeural"]
  ],
  "Portuguese (Portugal)": [
    ["pt-PT-FernandaNeural", "FernandaNeural"],
    ["pt-PT-RaquelNeural", "RaquelNeural"],
    ["pt-PT-DuarteNeural", "DuarteNeural"]
  ],
  "Romanian (Romania)": [
    ["ro-RO-AlinaNeural", "AlinaNeural"],
    ["ro-RO-EmilNeural", "EmilNeural"]
  ],
  "Russian (Russia)": [
    ["ru-RU-DariyaNeural", "DariyaNeural"],
    ["ru-RU-SvetlanaNeural", "SvetlanaNeural"],
    ["ru-RU-DmitryNeural", "DmitryNeural"]
  ],
  "Slovak (Slovakia)": [
    ["sk-SK-ViktoriaNeural", "ViktoriaNeural"],
    ["sk-SK-LukasNeural", "LukasNeural"]
  ],
  "Slovenian (Slovenia)": [
    ["sl-SI-PetraNeural", "PetraNeural"],
    ["sl-SI-RokNeural", "RokNeural"]
  ],
  "Spanish (Argentina)": [
    ["es-AR-ElenaNeural", "ElenaNeural"],
    ["es-AR-TomasNeural", "TomasNeural"]
  ],
  "Spanish (Colombia)": [
    ["es-CO-SalomeNeural", "SalomeNeural"],
    ["es-CO-GonzaloNeural", "GonzaloNeural"]
  ],
  "Spanish (Mexico)": [
    ["es-MX-DaliaNeural", "DaliaNeural"],
    ["es-MX-JorgeNeural", "JorgeNeural", {styles: ["cheerful", "chat"]}]
  ],
  "Spanish (Spain)": [
    ["es-ES-ElviraNeural", "ElviraNeural"],
    ["es-ES-AlvaroNeural", "AlvaroNeural"]
  ],
  "Spanish (US)": [
    ["es-US-PalomaNeural", "PalomaNeural"],
    ["es-US-AlonsoNeural", "AlonsoNeural"]
  ],
  "Swahili (Kenya)": [
    ["sw-KE-ZuriNeural", "ZuriNeural"],
    ["sw-KE-RafikiNeural", "RafikiNeural"]
  ],
  "Swedish (Sweden)": [
    ["sv-SE-HilleviNeural", "HilleviNeural"],
    ["sv-SE-SofieNeural", "SofieNeural"],
    ["sv-SE-MattiasNeural", "MattiasNeural"]
  ],
  "Tamil (India)": [
    ["ta-IN-PallaviNeural", "PallaviNeural"],
    ["ta-IN-ValluvarNeural", "ValluvarNeural"]
  ],
  "Telugu (India)": [
    ["te-IN-ShrutiNeural", "ShrutiNeural"],
    ["te-IN-MohanNeural", "MohanNeural"]
  ],
  "Thai (Thailand)": [
    ["th-TH-AcharaNeural", "AcharaNeural"],
    ["th-TH-PremwadeeNeural", "PremwadeeNeural"],
    ["th-TH-NiwatNeural", "NiwatNeural"]
  ],
  "Turkish (Turkey)": [
    ["tr-TR-EmelNeural", "EmelNeural"],
    ["tr-TR-AhmetNeural", "AhmetNeural"]
  ],
  "Ukrainian (Ukraine)": [
    ["uk-UA-PolinaNeural", "PolinaNeural"],
    ["uk-UA-OstapNeural", "OstapNeural"]
  ],
  "Urdu (Pakistan)": [
    ["ur-PK-UzmaNeural", "UzmaNeural"],
    ["ur-PK-AsadNeural", "AsadNeural"]
  ],
  "Vietnamese (Vietnam)": [
    ["vi-VN-HoaiMyNeural", "HoaiMyNeural"],
    ["vi-VN-NamMinhNeural", "NamMinhNeural"]
  ],
  "Welsh (United Kingdom)": [
    ["cy-GB-NiaNeural", "NiaNeural"],
    ["cy-GB-AledNeural", "AledNeural"]
  ],
};

export const tiktokVoices = [
  {value: "en_us_001", label: "En US Female"},
  {value: "en_us_006", label: "En US Male 1"},
  {value: "en_us_007", label: "En US Male 2"},
  {value: "en_us_009", label: "En US Male 3"},
  {value: "en_us_010", label: "En US Male 4"},

  {value: "en_uk_001", label: "En UK Male 1"},
  {value: "en_uk_003", label: "En UK Male 2"},

  {value: "en_au_001", label: "En AU Female"},
  {value: "en_au_002", label: "En AU Male"},

  {value: "fr_001", label: "Fr Male 1"},
  {value: "fr_002", label: "Fr Male 2"},

  {value: "de_001", label: "De Female"},
  {value: "de_002", label: "De Male"},

  {value: "es_002", label: "Es Male"},
  {value: "es_mx_002", label: "Es MX Male"},

  {value: "br_003", label: "Br Female 2"},
  {value: "br_004", label: "Br Female 3"},
  {value: "br_005", label: "Br Male"},

  {value: "id_001", label: "Id Female"},

  {value: "jp_001", label: "Jp Female 1"},
  {value: "jp_003", label: "Jp Female 2"},
  {value: "jp_005", label: "Jp Female 3"},
  {value: "jp_006", label: "Jp Male"},

  {value: "kr_002", label: "Kr Male 1"},
  {value: "kr_004", label: "Kr Male 2"},
  {value: "kr_003", label: "Kr Female"},

  {value: "en_us_ghostface", label: "Ghostface"},
  {value: "en_us_chewbacca", label: "Chewbacca"},
  {value: "en_us_c3po", label: "C3PO"},
  {value: "en_us_stitch", label: "Stitch"},
  {value: "en_us_stormtrooper", label: "Stormtrooper"},
  {value: "en_us_rocket", label: "Rocket"},

  {value: "en_male_funny", label: "Funny"},
  {value: "en_female_emotional", label: "Emotional"},
  {value: "en_male_narration", label: "Narrator"},
  {value: "en_male_wizard", label: "Wizard"},
  {value: "en_female_ht_f08_halloween", label: "Halloween"},
  {value: "en_female_madam_leota", label: "Madam Leota"},
  {value: "en_male_ghosthost", label: "Ghost Host"},
  {value: "en_male_pirate", label: "Pirate"},
  {value: "en_female_samc", label: "Empathetic"},
  {value: "en_male_cody", label: "Serious"},
  {value: "en_female_grandma", label: "Grandma"},
  {value: "en_male_grinch", label: "Grinch"},
  {value: "en_male_santa", label: "Santa"},
  {value: "en_male_cupid", label: "Cupid"},

  // Funny
  // Emotional
  // Narrator
  // Wizard
  // Halloween
  // Madam Leota
  // Ghost Host
  // Pirate
  // Empathetic

  // Serious
  // Grandma

  // Joker
  // Goblin

  // Grinch
  // Santa
  // Cupid

  {value: "en_female_f08_salut_damour", label: "Alto"},
  {value: "en_male_m03_lobby", label: "Tenor"},
  {value: "en_male_m03_sunshine_soon", label: "Sunshine Soon"},
  {value: "en_female_f08_warmy_breeze", label: "Warmy Breeze"},
  {value: "en_female_ht_f08_glorious", label: "Glorious"},
  {value: "en_male_sing_funny_it_goes_up", label: "It Goes Up"},
  {value: "en_male_m2_xhxs_m03_silly", label: "Chipmunk"},
  {value: "en_female_ht_f08_wonderful_world", label: "Dramatic"},
]
