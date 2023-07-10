// This code is NOT mine, it was made by IllDepence
// Repo: https://github.com/IllDepence/SVG_pitch

function circle(x, y, o) {
    r = '<circle r="5" cx="' + x + '" cy="' + y + '" style="opacity:1;fill:#f4f4f4;" />';
    if (o) {
        r += '<circle r="3.25" cx="' + x + '" cy="' + y + '" style="opacity:1;fill:#222529;" />';
    }
    return r
}
function text(x, mora) {
    if (mora.length == 1) {
        return '<text x="' + x + '" y="67.5" style="font-size:20px;fill:#f4f4f4;">' + mora + '</text>';
    }
    else {
        ret = '<text x="' + (x - 5) + '" y="67.5" style="font-size:20px;fill:#f4f4f4;">' + mora[0] + '</text>'
        ret += '<text x="' + (x + 12) + '" y="67.5" style="font-size:14px;fill:#f4f4f4;">' + mora[1] + '</text>';
        return ret
    }
}
function path(x, y, typ, step_width) {
    if (typ == 's') {  // straight
        delta = step_width + ',0';
    }
    else if (typ == 'u') {  // up
        delta = step_width + ',-25';
    }
    else if (typ == 'd') {  // down
        delta = step_width + ',25';
    }
    return '<path d="m ' + x + ',' + y + ' ' + delta + '" style="fill:none;stroke:#f4f4f4;stroke-width:1.5;" />';
}
function draw_pitch(reading, notation, where) {
    kana = reading;
    mora = to_mora_array(kana)
    pitch = notation;
    svg_container = where;
    positions = Math.max(mora.length, pitch.length);
    step_width = 35
    margin_lr = 16
    svg_width = Math.max(0, ((positions - 1) * step_width) + (margin_lr * 2));

    svg_str = '<svg width="' + svg_width + 'px" height="75px" viewBox="0 0 ' + svg_width + ' 75">';
    chars = '';
    for (i = 0; i < mora.length; i++) {
        x_center = margin_lr + (i * step_width);
        chars += text(x_center - 11, mora[i]);
    }
    circles = '';
    paths = '';
    for (i = 0; i < pitch.length; i++) {
        x_center = margin_lr + (i * step_width);
        if (['H', 'h', '1', '2'].indexOf(pitch[i]) >= 0) {
            y_center = 5;
        }
        else if (['L', 'l', '0'].indexOf(pitch[i]) >= 0) {
            y_center = 30;
        }
        else {
            bad_input();
            return false;
        }
        circles += circle(x_center, y_center, i >= mora.length);
        if (i > 0) {
            if (prev_center[1] == y_center) { path_typ = 's'; }
            if (prev_center[1] < y_center) { path_typ = 'd'; }
            if (prev_center[1] > y_center) { path_typ = 'u'; }
            paths += path(prev_center[0], prev_center[1], path_typ, step_width);
        }
        prev_center = [x_center, y_center];
    }
    svg_str += chars + paths + circles + '</svg>';
    svg_container.innerHTML = svg_str;
    return svg_str;
}
function to_mora_array(hira) {
    mora_arr = [];
    combiners = ['ゃ', 'ゅ', 'ょ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ',
        'ャ', 'ュ', 'ョ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ']
    for (i = 0; i < hira.length; i++) {
        if (i + 1 < hira.length && combiners.indexOf(hira[i + 1]) > -1) {
            // add two
            mora_arr.push(hira[i] + hira[i + 1]);
            i++; // jump
        }
        else {
            // add one
            mora_arr.push(hira[i]);
        }
    }
    return mora_arr;
}