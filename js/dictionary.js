window.dictionary = null;

class Dictionary {
    constructor() {
        this.items = [];
        this.selections = [];
        this.current = 0;
        this.loaded = false;
        this.audio = null;
        this.sentence = [];
    }

    async loadAudio(src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(src);
            audio.addEventListener('canplaythrough', () => {
                resolve(audio);
            });
            audio.addEventListener('error', (error) => {
                reject(error);
            });
        });
    }

    // Code from FooSoft/yomichan/ext/js/media/audio-system.js:75
    isAudioValid(audio) {
        const duration = audio.duration;
        return (
            duration !== 5.694694 && // Invalid audio (Chrome)
            duration !== 5.720718    // Invalid audio (Firefox)
        );
    }
    
    async read(limit_ms = 2500) {
        return new Promise(async (resolve, reject) => {
            let dictionary_amount = 6;
            let dictionary_prefix = "yjdict_";
            let successful = 0;
            setTimeout(() => {
                if (successful == dictionary_amount) {
                    this.loaded = true;
                    resolve();
                } else {
                    console.log(successful, dictionary_amount);
                    reject();
                }
            }, limit_ms);

            for (let i = 0; i < dictionary_amount; i++) {
                fetch(`./dictionary/${dictionary_prefix}${i + 1}.json`, { method: "GET" }).then(res => res.json()).then(res => {
                    this.items.push(...res);
                    successful++;
                    if (i == dictionary_amount-1){ // if last item
                        this.loaded = true;
                        resolve();
                    }
                }).catch(reject);
            }
        });
    }
    get(expression) {
        let res = [];
        this.items.forEach(item => {
            if (item.expression == expression) {
                res.push(item);
            }
        });
        this.selections = res;
        return res;
    }
}

window.dictionary = new Dictionary();
(async () => {
    let status_display = document.getElementById("dictionary_status");
    try {
        await window.dictionary.read(5000);
        status_display.innerHTML = "Dictionary: OK";
        status_display.setAttribute("class", "badge bg-success");
    } catch (e) {
        status_display.innerHTML = "Dictionary: ERR";
        status_display.setAttribute("class", "badge bg-danger");
    }
})();