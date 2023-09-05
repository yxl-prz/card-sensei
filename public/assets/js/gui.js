let input_container = document.getElementById("inputs");
let card_container = document.getElementById("main-card");

let inputs = {
    expression: window.util.create_floating_input("text", "Example: 日本語", "Expression"),
    add_to_anki: window.util.create_button("Add to Anki", async () => {
        let preferred_language = window.settings.get_value("PreferredLanguage");
        let exp = dictionary.current_expression();
        if (!exp) {
            console.warn("[Interface] Can not add an empty expression...");
            return;
        }
        console.log("[Interface] Adding to Anki...");

        let sentence = window.dictionary.current_sentence();
        let translations = "";


        if (window.dictionary.sentence_has_language(preferred_language)) {
            translations = window.util.array_to_itemed_list(...sentence.translations[preferred_language]).innerHTML;
        }

        let anki_audio_file = "";

        if (window.dictionary.expression.audio) {
            try {
                anki_audio_file = await anki.store_audio(exp.expression, exp.reading, window.dictionary.expression.audio);
            } catch (e) {
                console.warn(`[Interface] Error loading audio into Anki; Attempting to add without audio...`);
            }
        }

        anki.add(
            inputs.anki_deck_select.children[0].value,
            exp.expression,
            exp.reading,
            exp.definitions[preferred_language].join(", "),
            (window.dictionary.expression.audio == null) ? "" : `[sound:${anki_audio_file}]`,
            (sentence) ? sentence.markdown : "",
            (sentence.translations[preferred_language]) ? translations : "",
            dictionary.pitch_accent).then(res => {
                console.log("[Interface] Added to Anki");
            }).catch(e => {
                console.error(`[Interface] Error adding to Anki; ${e}`);
            })
    }),
    anki_deck_select: window.util.create_floating_select("Deck", items = window.anki.decks, "Deck", 0),
    next_definition: window.util.create_button("Next Definition", async () => {
        window.dictionary.expression.selected++;
        await create_flashcard();
    }),
    previous_definition: window.util.create_button("Previous Definition", async () => {
        window.dictionary.expression.selected--;
        await create_flashcard();
    }),
    next_sentence: window.util.create_button("Next Sentence", async () => {
        window.dictionary.sentence.selected++;
        await create_flashcard();
    }),
    previous_sentence: window.util.create_button("Previous Sentence", async () => {
        window.dictionary.sentence.selected--;
        await create_flashcard();
    }),
};

window.util.lazy_input_pre(inputs.expression, () => {
    window.dictionary.reset();
}, (_event, DOM) => {
    create_flashcard(DOM.children[0].value);
}, "input", "750");

let handle_error = (e) => {

}

let create_flashcard = async (exp = null, reset_sentence = false) => {
    if (exp != null) {
        window.dictionary.expression.selected = 0;
        window.dictionary.sentence.selected = 0;
        window.dictionary.expression.audio = null;
        try {
            await window.dictionary.fetch_expression(exp);
        } catch (e) {
            card_container.innerHTML = "";
        }
    }

    if (reset_sentence) {
        window.dictionary.sentence.selected = 0;
    }

    let expression = window.dictionary.current_expression();
    let sentence = window.dictionary.current_sentence();
    let preferred_language = window.settings.get_value("PreferredLanguage");

    if (window.dictionary.expression_has_next()) {
        inputs.next_definition.removeAttribute("disabled");
    } else {
        inputs.next_definition.setAttribute("disabled", "");
    }

    if (window.dictionary.expression_has_previous()) {
        inputs.previous_definition.removeAttribute("disabled");
    } else {
        inputs.previous_definition.setAttribute("disabled", "");
    }

    if (window.dictionary.sentence_has_next()) {
        inputs.next_sentence.removeAttribute("disabled");
    } else {
        inputs.next_sentence.setAttribute("disabled", "");
    }

    if (window.dictionary.sentence_has_previous()) {
        inputs.previous_sentence.removeAttribute("disabled");
    } else {
        inputs.previous_sentence.setAttribute("disabled", "");
    }

    let expression_audio = null;
    try {
        expression_audio = await window.dictionary.get_audio(expression.expression, expression.reading);
        window.dictionary.expression.audio = expression_audio;
    } catch (e) { };

    let card_components = {
        play_buton: window.util.create_button("▷", () => {
            expression_audio.play();
        }, "btn btn-primary play-btn"),
        expression: window.util.create_text_element("h1", expression.expression, "kanji"),
        pitch_accent: document.createElement("div"),
    };

    card_components.pitch_accent.setAttribute("class", "pitch");

    if (expression.pitches && expression.pitches.length > 0) {
        window.dictionary.pitch_accent = draw_pitch(expression.reading, expression.pitches[0].notation.join(""), card_components.pitch_accent);
    } else {
        window.dictionary.pitch_accent = "";
    }


    card_components.expression.setAttribute("t", expression.reading);

    if (window.settings.get_value("PlayAudioOnFetch") == "true") {
        expression_audio.play();
    }

    card_container.innerHTML = "";

    if (expression_audio != undefined) {
        let div = document.createElement("div");
        div.setAttribute("class", "expression");
        div.append(card_components.play_buton, card_components.expression);
        card_components.expression = div;
    }


    let definitions = expression.definitions["en"];
    if (window.dictionary.expression_has_language(preferred_language)) {
        definitions = expression.definitions[preferred_language];
    }

    let translations = null;
    if (window.dictionary.sentence_has_language(preferred_language)) {
        translations = window.util.array_to_itemed_list(...sentence.translations[preferred_language])
    }

    card_container.append(
        card_components.expression,
        document.createElement("hr"),
        card_components.pitch_accent,
        document.createElement("hr"),
        window.util.array_to_itemed_list(...definitions),
        document.createElement("hr"),
        document.createElement("br"),
        (sentence != undefined) ? window.util.create_text_element("h1", sentence.markdown) : "",
        (translations != null) ? translations : ""
    );
}


let anki_connection_check = async () => {
    console.log(`[Anki] Checking for Anki on port :${window.anki.port}`);
    try {
        await window.anki.refresh();
    } catch (e) {
        console.error(
            `[Anki] Error; (${e}); make sure\n`,
            "-  1. Anki is open\n",
            "-  2. AnkiConnect has the correct CORS setting\n",
            "-  3. AnkiConnect's port is the same as the one in Card先生's settings'\n"
        );
    };

    try {
        if (!await anki.has_model()) {
            anki.add_model();
            console.log(`[Anki] Added Model "${ModelName}"`);
        }
    } catch (e) {
        console.error(`[Anki] Error adding Model; ${e}`);
    }

    if (!window.anki.connected) {
        inputs.add_to_anki.setAttribute("disabled", "");
        inputs.anki_deck_select.children[0].setAttribute("disabled", "");
        inputs.anki_deck_select.children[0].innerHTML = "";
    } else {
        inputs.add_to_anki.removeAttribute("disabled");
        inputs.anki_deck_select.children[0].removeAttribute("disabled");
        inputs.anki_deck_select.children[0].innerHTML = "";
        inputs.anki_deck_select.children[0].append(...window.util.array_to_options(...window.anki.deck_names()));
    }
};

inputs.expression.setAttribute("class", `${inputs.expression.getAttribute("class")} mb-3`);
inputs.add_to_anki.setAttribute("style", "width: 100%;height: 100%;");
let add_to_anki_rows = window.util.make_row(inputs.anki_deck_select, inputs.add_to_anki);
add_to_anki_rows.children[0].setAttribute("class", "col-9");
add_to_anki_rows.children[1].setAttribute("class", "col-3");

let definition_navigation_buttons = window.util.make_row(inputs.previous_definition, inputs.next_definition);
let setnence_navigation_buttons = window.util.make_row(inputs.previous_sentence, inputs.next_sentence);

inputs.next_definition.setAttribute("disabled", "");
inputs.previous_definition.setAttribute("disabled", "");
inputs.next_sentence.setAttribute("disabled", "");
inputs.previous_sentence.setAttribute("disabled", "");

input_container.innerHTML = "";
input_container.append(
    inputs.expression,
    add_to_anki_rows,
    document.createElement("br"),
    document.createElement("hr"),
    document.createElement("br"),
    definition_navigation_buttons,
    document.createElement("br"),
    document.createElement("hr"),
    document.createElement("br"),
    setnence_navigation_buttons,
);

anki_connection_check(); // Initial check
setInterval(anki_connection_check, 60000); // Check the connection every minute
addEventListener("focus", anki_connection_check); // or when the page is focused again