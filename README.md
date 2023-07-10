<h1 align="center">Card先生 - Easier Flashcards</h1>
<p align="center">
    <a href="https://www.rust-lang.org/" alt="Made In">
        <img src="https://img.shields.io/badge/MADE WITH-JavaScript-yellow?style=for-the-badge&logo=javascript&logoColor=yellow" /></a>
    <a href="https://github.com/yxl-prz/card-sensei/releases/latest" alt="Version">
        <img src="https://img.shields.io/badge/VERSION-1.0.0-yellow?style=for-the-badge" /></a>
    <a href="https://github.com/yxl-prz/card-sensei/graphs/contributors" alt="Version">
        <img src="https://img.shields.io/github/contributors/yxl-prz/card-sensei?style=for-the-badge" /></a>
</p>


## Requirements
- [Anki](https://apps.ankiweb.net/) (of course)
- - [AnkiConnect v6](https://foosoft.net/projects/anki-connect/)
- - - Set config's `webCorsOriginList`
- - - - 0. (Skip these steps if you plan to run this on your own PC)
- - - - 1. Go to **Tools > Add-ons**
- - - - 2. Select **AnkiConnect** and press **Config**
- - - - 3. Either change the default `"http://127.0.0.1"` on `webCorsOriginList` to `*` or add `https://card-sensei.yxl-prz.repl.co` to the list
- - - - 4. `[ "http://localhost" ]` -> `[ "http://localhost", "https://card-sensei.yxl-prz.repl.co" ]`

## Disclaimer
This project is not affiliated with Anki, JapanesePod101 or any of their employees and therefore does not reflect the views of said parties. This is purely a fan-made project.

Said parties does not endorse or sponsor this project.

## Credits
* Database(s)
* * [yxl-prz/YJDict](https://github.com/yxl-prz/YJDict)
* Pitch Accent Drawer
* * [IllDepence/SVG_pitch](https://github.com/IllDepence/SVG_pitch)
* Audio
* * [JapanesePod101](https://www.japanesepod101.com/)