/* mock-require.js

Placeholder for require function so that commonsJS modules
can be included unchanged in a browser

Konrad Markus <konker@gmail.com>
*/

if (typeof require === 'undefined') {
    function require(module) {
        if (module && module.indexOf('./') == 0) {
            module = module.substr(2);
        }
        module = module.replace(/-/, '.');
        if (typeof this[module] === 'undefined') {
            console.log('Module not found: ' + module);
        }
        return this[module];
    }
}
