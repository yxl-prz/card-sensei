class DictionaryHandler {
    constructor() {
        this.pitch_accent = "";
        this.expression = {
            selected: 0,
            list: [],
            audio: null
        };

        this.sentence = {
            selected: 0,
            list: []
        };
    }

    init() {
        console.log("[Dictionary] Initialized");
        // No neccesary initialization
    }

    async fetch_expression(expression) {
        return new Promise((resolve, reject) => {
            console.log(`[Dictionary] Fetching for expression ('${expression}')`);
            for (let i = 0; i < 1; i++) {
                fetch(`/expression/${expression}`).then(res => res.json()).then(res => {
                    if (res.status != 200) {
                        console.error(`[Dictionary] Error Code ${res.status} while fetching`);
                        reject();
                        return;
                    }
                    this.expression.list = res.expression;
                    let lang = settings.get_value("PreferredLanguage");
                    this.sentence.list = res.sentence.sort((a, b) => {
                        if (a.translations[lang] && !b.translations[lang]) {
                            return -1;
                        } else if (!a.translations[lang] && b.translations[lang]) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    resolve();
                }).catch(err => {
                    console.error(`[Dictionary] Error while fetching: ${err}`);
                })
            }
        });
    }

    reset() {
        this.expression.selected = 0;
        this.expression.list = [];
        this.sentence.selected = 0;
        this.sentence.list = [];
    }

    async get_audio(expression = "", reading = "") {
        return new Promise((resolve, reject) => {
            const audio = new Audio(`https://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kanji=${encodeURI(expression)}${reading != "" ? `&kana=${encodeURI(reading)}` : ""}`);
            audio.addEventListener('canplaythrough', () => {
                const duration = audio.duration;
                if (duration !== 5.694694 && duration !== 5.720718) {
                    resolve(audio);
                    return;
                }
                resolve(undefined);
            });
            audio.addEventListener('error', (error) => {
                reject(error);
            });
        });

    }

    // +--------------------+
    // | Expression Methods |
    // +--------------------+
    current_expression() {
        return this.expression.list[this.expression.selected];
    }

    expression_has_next() {
        return this.expression.list[this.expression.selected + 1] != undefined;
    }

    expression_has_previous() {
        return (this.expression.selected == 0) ? false : this.expression.list[this.expression.selected - 1] != undefined;
    }

    expression_iterate(callback = () => { return false; }) {
        let res = [];
        this.expression.list.forEach(exp => {
            if (callback(exp)) {
                res.push(exp);
            }
        });
        return res;
    }

    expression_has_language(language = "es") {
        return this.current_expression().definitions[language] != undefined
    }

    // +--------------------+
    // | Sentence   Methods |
    // +--------------------+
    current_sentence() {
        return this.sentence.list[this.sentence.selected];
    }

    sentence_has_next() {
        return this.sentence.list[this.sentence.selected + 1] != undefined;
    }

    sentence_has_previous() {
        return (this.sentence.selected == 0) ? false : this.sentence.list[this.sentence.selected - 1] != undefined;
    }

    sentence_iterate(callback = () => { return false; }) {
        let res = [];
        this.sentence.list.forEach(sent => {
            if (callback(sent)) {
                res.push(sent);
            }
        });
        return res;
    }

    sentence_has_language(language = "es") {
        return this.current_sentence().translations[language] != undefined;
    }
}

window.dictionary = new DictionaryHandler();
window.dictionary.init();