window.anki = null;

const ModelName = "Card先生.v0.2";

class Anki {
    constructor() {
        this.port = parseInt(window.settings.get_value("AnkiPort")) || 8765;
        this.url = `http://localhost:{{port}}`;
        this.version = 6;
        this.decks = {};

        this.connected = false;
    }

    async refresh() {
        return new Promise(async (resolve, reject) => {
            try {
                let deck_names = await this.request("deckNames", {});
                let decks = await this.request("getDeckStats", { decks: deck_names });
                this.decks = decks;
                this.connected = true;
                resolve(this.decks);
            } catch (e) {
                this.connected = false;
                reject(e);
            }
        });
    }

    async store_audio(url, filename) {
        return new Promise(async (resolve, reject) => {
            this.request("storeMediaFile", {
                filename, url
            }).then(() => { resolve(filename) }).catch(reject);
        });
    }

    deck_names() {
        let res = [];
        Object.keys(this.decks).forEach(deck => {
            res.push(this.decks[deck].name);
        })
        return res;
    }

    async add(deck, Kanji, Reading, Definitions, Audio="", Sentence="", SentenceTranslation="", PitchAccent="") {
        return new Promise(async (resolve, reject) => {
            this.request("guiAddCards", {
                "note": {
                    "deckName": deck,
                    "modelName": ModelName,
                    "fields": {
                        Kanji,
                        Reading,
                        Definitions,
                        Audio,
                        Sentence,
                        SentenceTranslation,
                        PitchAccent
                    },
                    "tags": [
                        "Card先生"
                    ]
                }
            }).then(() => { resolve(filename) }).catch(reject);
        });
    }

    async has_model() {
        return new Promise((resolve, reject) => {
            anki.request("modelNames").then(models => {
                models.forEach(model => {
                    if (model == ModelName) {
                        resolve(true);
                    }
                });
                resolve(false);
            })
        });
    }

    async add_model() {
        return new Promise((resolve, reject) => {
            this.request("createModel", {
                "modelName": ModelName,
                "inOrderFields": ["Kanji", "Reading", "Definitions", "Audio", "Sentence", "SentenceTranslation", "PitchAccent"],
                "isCloze": false,
                "cardTemplates": [
                    {
                        "Name": ModelName,
                        "Front": `<div style="text-align: center;"><h1><span>{{Audio}}</span> <span>{{Kanji}}</span></h1></div>`,
                        "Back": `<div style="text-align: center;"><h1><span>{{Audio}}</span> <span><ruby>{{Kanji}}<rp>（</rp><rt>{{Reading}}</rt><rp>）</rp></ruby><br><br>{{PitchAccent}}</span></h1><hr><h1>{{Definitions}}</h1><br><hr><div class="sentence"><h1>{{Sentence}}</h1><h2>{{SentenceTranslation}}</h2></div></div>`
                    }
                ]
            }).then(resolve).catch(reject);
        });
    }

    async store_audio(expression, reading, audio=Audio) {
        return new Promise(async (resolve, reject) => {
            let filename = `${expression}_${reading}.mp3`;
            this.request("storeMediaFile", {
                "filename": filename,
                "url": audio.src
            }).then(() => { resolve(filename) }).catch(reject);
        });
    }

    // Directly pulled from https://foosoft.net/projects/anki-connect/ :
    async request(action, params = {}) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.addEventListener('error', () => reject('failed to issue request'));
            xhr.addEventListener('load', () => {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (Object.getOwnPropertyNames(response).length != 2) {
                        throw 'response has an unexpected number of fields';
                    }
                    if (!response.hasOwnProperty('error')) {
                        throw 'response is missing required error field';
                    }
                    if (!response.hasOwnProperty('result')) {
                        throw 'response is missing required result field';
                    }
                    if (response.error) {
                        throw response.error;
                    }
                    resolve(response.result);
                } catch (e) {
                    reject(e);
                }
            });

            xhr.open('POST', this.url.replaceAll("{{port}}", this.port));
            let version = this.version;
            xhr.send(JSON.stringify({ action, version, params }));
        });
    }
}

window.anki = new Anki();
window.anki.refresh();