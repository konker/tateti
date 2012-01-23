$(document).ready(function() {
    module("Module tateti.js");

    test("Board OK", function() {
        expect(6);

        var b = new tateti.Board();
        equals(b.toString(),
               " --------------\n"  +
               "| .  | .  | .  |\n" +
               "| .  | .  | .  |\n" +
               "| .  | .  | .  |\n" +
               " --------------",
        "Empty board");

        b.set(tateti.P1, tateti.A);
        equals(b.toString(),
               " --------------\n"  +
               "| P1 | .  | .  |\n" +
               "| .  | .  | .  |\n" +
               "| .  | .  | .  |\n" +
               " --------------",
        "Move 1");

        b.set(tateti.P2, tateti.B);
        equals(b.toString(),
               " --------------\n"  +
               "| P1 | P2 | .  |\n" +
               "| .  | .  | .  |\n" +
               "| .  | .  | .  |\n" +
               " --------------",
        "Move 2");

        b.set(tateti.P1, tateti.D);
        equals(b.toString(),
               " --------------\n"  +
               "| P1 | P2 | .  |\n" +
               "| P1 | .  | .  |\n" +
               "| .  | .  | .  |\n" +
               " --------------",
        "Move 3");

        b.set(tateti.P2, tateti.E);
        equals(b.toString(),
               " --------------\n"  +
               "| P1 | P2 | .  |\n" +
               "| P1 | P2 | .  |\n" +
               "| .  | .  | .  |\n" +
               " --------------",
        "Move 4");

        b.set(tateti.P1, tateti.G);
        equals(b.toString(),
               " --------------\n"  +
               "| P1 | P2 | .  |\n" +
               "| P1 | P2 | .  |\n" +
               "| P1 | .  | .  |\n" +
               " --------------",
        "Move 5");

    });
});
