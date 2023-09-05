window.event_timers = {};

function RandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

window.util = {
    lazy_input: (dom, callback = (event, dom) => { }, evnt = "input", wait = 500) => {
        let key = RandomString(8);
        dom.addEventListener(evnt, (ev) => {
            clearTimeout(window.event_timers[key]);
            window.event_timers[key] = setTimeout(() => {
                callback(ev, dom);
            }, wait);
        });
    },
    lazy_input_pre: (dom, pre = () => { }, callback = (event, dom) => { }, evnt = "input", wait = 500) => {
        let key = RandomString(8);
        dom.addEventListener(evnt, (ev) => {
            pre();
            clearTimeout(window.event_timers[key]);
            window.event_timers[key] = setTimeout(() => {
                callback(ev, dom);
            }, wait);
        });
    },
    create_floating_input(type = "text", placeholder = null, floating_text = null) {
        let id = `input-${RandomString(8)}`;
        let div = document.createElement("div");
        div.setAttribute("class", "form-floating");
        let input = document.createElement("input");
        input.setAttribute("class", "form-control");
        input.setAttribute("type", type);
        input.setAttribute("id", id);
        if (placeholder != null) {
            input.setAttribute("placeholder", placeholder);
        }
        let label = document.createElement("label");
        label.setAttribute("for", id);
        if (floating_text != null) {
            label.innerHTML = floating_text;
        }
        div.append(input);
        div.append(label);
        return div;
    },
    create_text_element: (_type = "h1", text = "<unset>", _class = null, style = null) => {
        let res = document.createElement("h1");
        res.innerHTML = text;
        if (_class != null) {
            res.setAttribute("class", _class);
        }

        if (style != null) {
            res.setAttribute("style", style);
        }

        return res;
    },
    create_button: (text, callback = (ev, dom) => { }, style = "btn btn-primary") => {
        let btn = document.createElement("button");
        btn.setAttribute("class", style);
        btn.innerHTML = text;
        btn.addEventListener("click", (ev) => {
            callback(ev, btn);
        });
        return btn;
    },
    create_select: (placeholder = "<unset>", items = ["<unset>", "<unset>"], selected = 0) => {
        let select = document.createElement("select");
        select.setAttribute("placeholder", placeholder);
        for (let i = 0; i < items.length; i++) {
            let opt = document.createElement("option");
            if (i == selected) {
                opt.setAttribute("selected", "");
            }
            opt.innerHTML = items[i];
            opt.setAttribute("value", i);
            select.append(opt);
        }

        return select;
    },
    create_floating_select: (placeholder = "<unset>", items = ["<unset>", "<unset>"], floating_text = null, selected = 0) => {
        let id = `input-${RandomString(8)}`;
        let div = document.createElement("div");
        div.setAttribute("class", "form-floating");
        let input = window.util.create_select(placeholder, items, selected);
        input.setAttribute("class", "form-select");
        let label = document.createElement("label");
        label.setAttribute("for", id);
        if (floating_text != null) {
            label.innerHTML = floating_text;
        }
        div.append(input);
        div.append(label);
        return div;
    },
    array_to_options: (...data) => {
        let opts = [];
        data.forEach(dt => {
            let opt = document.createElement("option");
            opt.innerHTML = dt;
            opts.push(opt);
        })
        return opts;
    },
    array_to_itemed_list: (...data) => {
        let ol = document.createElement("ol");
        data.forEach(dt => {
            let opt = document.createElement("li");
            ol.append(opt);
            opt.innerHTML = dt;
        })
        return ol;
    },
    make_row: (...items) => {
        let row = document.createElement("div");
        row.setAttribute("class", "row");
        items.forEach(item => {
            let col = document.createElement("div");
            col.setAttribute("class", "col");
            col.append(item);
            row.append(col);
        });
        return row;
    },
}