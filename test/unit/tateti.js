$(document).ready(function() {
    module("Module tateti.js");

    test("Board", function() {
        expect(1);

        var b = new tateti.Board();
        equals(b.toString(),
               " --------------\n"  +
               "| .  | .  | .  |\n" +
               "| .  | .  | .  |\n" +
               "| .  | .  | .  |\n" +
               " --------------"
         );
    });
});
