window.anki = null;

class Anki {
    constructor() {
        this.url = "http://localhost:8765";
        this.version = 6;
        this.decks = [];

        this.connected = false;

        this.connection_display = document.getElementById("anki-connection");
    }
    async refresh() {
        try {
            let deck_names = await this.request("deckNames", {});
            let decks = await this.request("getDeckStats", { decks: deck_names });
            this.decks = decks;
            this.connected = true;
        } catch(e) {
            this.connected = false;
            console.error(e);
        }

        if (this.connected) {
            this.connection_display.innerHTML = "Anki: OK";
            this.connection_display.setAttribute("class", "badge bg-success");
        } else {
            this.connection_display.innerHTML = "Anki: ERR";
            this.connection_display.setAttribute("class", "badge bg-danger");
        }
    }
    async store_current_audio() {
        return new Promise(async (resolve, reject) => {
            let expression = window.dictionary.selections[window.dictionary.current];
            let filename = `${expression.expression}_${expression.reading}_${expression.id}.mp3`;
            this.request("storeMediaFile", {
                "filename": filename,
                "url": window.dictionary.audio.src
            }).then(() => { resolve(filename) }).catch(reject);
        });
    }
    // Directly pulled from https://foosoft.net/projects/anki-connect/ :
    request(action, params={}) {
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
    
            xhr.open('POST', this.url);
            let version = this.version;
            xhr.send(JSON.stringify({action, version, params}));
        });
    }
}

window.anki = new Anki();
window.anki.refresh();