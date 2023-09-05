class SettingManager {
    constructor() {
        this.settings = {};
    }

    init() {
        window.setting_list.forEach(setting => {
            let cookie = window.settings.get_cookie(setting[0]);
            if (cookie == null) {
                this.set_value(setting[0], setting[1]);
                this.settings[setting[0]] = setting[1];
            } else {
                let num = parseInt(cookie);
                if (num != NaN) {
                    this.settings[setting[0]] = cookie;
                } else if (cookie.toLowerCase() == "true") {
                    this.settings[setting[0]] = true;
                } else if (cookie.toLowerCase() == "false") {
                    this.settings[setting[0]] = false;
                } else {
                    this.settings[setting[0]] = num;
                }
            }
        });
        console.log("[Settings] Initialized");
    }

    set_value(setting_name, setting_value) {
        this.set_cookie(setting_name, setting_value);
        this.settings[setting_name] = setting_value;
        console.log(`[Settings] '${setting_name}' was changed to '${setting_value}'`);
    }

    get_value(setting_name) {
        return this.settings[setting_name];
    }

    // Code from W3Schools:
    set_cookie(cname, cvalue, exdays=365) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    get_cookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    }
}

window.setting_list = [
    ["PreferredLanguage",  "en"],
    ["AnkiPort"         ,  8765],
    ["PlayAudioOnFetch" , false],
];

window.settings = new SettingManager();
window.settings.init();