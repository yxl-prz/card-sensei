let inputs = document.getElementById("inputs");
let card = document.getElementById("card");
let input_timer;

// Search Input
let search_input = document.createElement("input");
search_input.setAttribute("class", "form-control");
search_input.setAttribute("style", "width: 15em");
search_input.setAttribute("disabled", "");
search_input.placeholder = "Expression (ex: 日本語)";
// Previous Definition
let previous_definition = document.createElement("button");
previous_definition.innerText = "<";
previous_definition.setAttribute("class", "btn btn-secondary");
previous_definition.addEventListener("click", () => {
    if (window.dictionary.current - 1 < 0) { return; }
    window.dictionary.current--;
    create_flashcard();
});
// Next Definition
let next_definition = document.createElement("button");
next_definition.innerText = ">";
next_definition.setAttribute("class", "btn btn-secondary");
next_definition.addEventListener("click", () => {
    if (window.dictionary.current + 1 > window.dictionary.selections.length) {
        return;
    }
    window.dictionary.current++;
    create_flashcard();
});
// Don't allow input until dictionary laoded
(() => {
    let t = setInterval(() => {
        if (window.dictionary.loaded) {
            search_input.removeAttribute("disabled", "");
            clearInterval(t);
        }
    }, 100);
})();

// Wait 500ms after last input to search
search_input.addEventListener("input", (_event) => {
    window.dictionary.selections = [];
    window.dictionary.current = 0;
    window.dictionary.audio = null;
    clearTimeout(input_timer);
    input_timer = setTimeout(() => {
        create_flashcard(search_input.value);
    }, 500);
});

let invalid_input = () => {
    previous_definition.setAttribute("disabled", "");
    next_definition.setAttribute("disabled", "");
    card.innerHTML = "";
};

let not_found = () => {
    previous_definition.setAttribute("disabled", "");
    next_definition.setAttribute("disabled", "");
    card.innerHTML = "<div style=\"width:35em\" class=\"alert alert-warning\" role=\"alert\"><h1 class=\"expression\" furigana=\"Nothing was Found!\">⚠ 何もが見つけなかった！</h1></div>";
};

let create_flashcard = async (expression = null) => {
    if (window.dictionary.selections.length == 0 && expression != null) {
        window.dictionary.get(expression.replaceAll(" ", ""));
    }

    if (expression != null && expression == "" && expression == " ") {
        invalid_input();
        return;
    }

    if (window.dictionary.selections.length == 0) {
        not_found();
        return;
    }

    previous_definition.removeAttribute("disabled", "");
    next_definition.removeAttribute("disabled", "");

    if (window.dictionary.current == 0) {
        previous_definition.setAttribute("disabled", "");
    }

    if (window.dictionary.current >= window.dictionary.selections.length - 1) {
        next_definition.setAttribute("disabled", "");
    }
    ;
    let current_expression = window.dictionary.selections[window.dictionary.current]
    let pitch_accent_svg = null;
    window.dictionary.audio = await window.dictionary.loadAudio(`https://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kanji=${encodeURI(current_expression.expression)}${current_expression.reading != "" ? `&kana=${encodeURI(current_expression.reading)}` : ""}`)
    let header = document.createElement("h1");
    let subtitle = document.createElement("p");
    header.setAttribute("class", "expression");
    header.setAttribute("furigana", current_expression.reading);
    header.innerText = current_expression.expression;

    subtitle.innerHTML = current_expression.definitions.en.join("<br>");

    card.innerHTML = "";
    let expression_item = header;
    if (window.dictionary.isAudioValid(window.dictionary.audio)) {
        expression_item = document.createElement("div");
        expression_item.setAttribute("class", "expression-holder");

        let audio_btn = document.createElement("button");
        audio_btn.innerText = "▷";
        audio_btn.setAttribute("class", "play-button");
        audio_btn.addEventListener("click", (_event) => {
            window.dictionary.audio.play();
        });

        expression_item.append(audio_btn);
        expression_item.append(header);
    }

    card.append(expression_item);

    if (current_expression.pitch && current_expression.pitch.length > 0) {
        card.append(document.createElement("hr"));
        let pitch_accent = document.createElement("div");
        pitch_accent.setAttribute("class", "pitch-accent");
        pitch_accent_svg = draw_pitch(current_expression.reading, current_expression.pitch[0].notation, pitch_accent);
        card.append(pitch_accent);
    }

    card.append(document.createElement("hr"));
    card.append(subtitle);
    card.append(document.createElement("hr"));

    let language_selections = document.createElement("select");
    Object.keys(current_expression.definitions).forEach(language => {
        if (current_expression.definitions[language].length > 0) {
            let opt = document.createElement("option");
            opt.setAttribute("value", language);
            opt.innerHTML = language.toUpperCase();
            language_selections.append(opt);
        }
    });

    language_selections.addEventListener("change", () => {
        subtitle.innerHTML = current_expression.definitions[language_selections.value].join("<br>");
    });
    language_selections.setAttribute("class", "form-select language_selection_select");


    if (anki.connected) {
        let deck_select = document.createElement("select");
        Object.keys(window.anki.decks).forEach(deck_id => {
            let opt = document.createElement("option");
            opt.innerText = window.anki.decks[deck_id].name;
            opt.setAttribute("value", `${deck_id}`);
            deck_select.append(opt);
        });

        let anki_add_button = document.createElement("button");
        anki_add_button.innerText = "Add";
        anki_add_button.setAttribute("class", "btn btn-secondary")
        anki_add_button.addEventListener("click", async (_event) => {
            if (!window.anki.connected) { return; }
            let deck = window.anki.decks[deck_select.value];
            try {
                let filename = await window.anki.store_current_audio();
                window.anki.request("guiAddCards", {
                    "note": {
                        "deckName": deck.name,
                        "modelName": "Japanese-75658",
                        "fields": {
                            "Vocabulary-Kanji": `<div style="text-align: center;">${current_expression.expression}</div>`,
                            "Vocabulary-Furigana": `<div style="text-align: center;">ＪＲ[<ruby>${current_expression.expression}<rt>${current_expression.reading}</rt></ruby>]</div>`,
                            "Vocabulary-Kana": `<div style="text-align: center;">${current_expression.reading}<br>${pitch_accent_svg == null ? "" : `<hr>${pitch_accent_svg}`}</div>`,
                            "Vocabulary-English": `<div style="text-align: center;">${current_expression.definitions[language_selections.value].join(", ")}</div>`,
                            "Vocabulary-Audio": `[sound:${filename}]`
                        },
                        "tags": [],
                        "picture": []
                    }
                });
            } catch (e) {
                // error saving cards
            }
        });

        let anki_add = document.createElement("div");
        anki_add.setAttribute("class", "anki-add-container");
        
        deck_select.setAttribute("class", "form-select anki-add-deck-select");
        anki_add.append(deck_select);
        anki_add.append(language_selections);
        anki_add.append(anki_add_button);

        card.append(anki_add);
    } else {
        card.append(language_selections);
    }
};

inputs.append(previous_definition);
inputs.append(search_input);
inputs.append(next_definition);
