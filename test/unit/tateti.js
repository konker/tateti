$(document).ready(function() {
    module("Module tateti.js");

    test("Board OK", function() {
        expect(10);

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

        b.set(tateti.P1, tateti.H);
        equals(b.toString(),
               " --------------\n"  +
               "| P1 | P2 | .  |\n" +
               "| P1 | P2 | .  |\n" +
               "| .  | P1 | .  |\n" +
               " --------------",
        "Move 5");

        b.set(tateti.P2, tateti.I);
        equals(b.toString(),
               " --------------\n"  +
               "| P1 | P2 | .  |\n" +
               "| P1 | P2 | .  |\n" +
               "| .  | P1 | P2 |\n" +
               " --------------",
        "Move 6");

        b.move(tateti.H, tateti.G);
        equals(b.toString(),
               " --------------\n"  +
               "| P1 | P2 | .  |\n" +
               "| P1 | P2 | .  |\n" +
               "| P1 | .  | P2 |\n" +
               " --------------",
        "Move 7");

        ok(b.gameOver, "Game over");

        deepEqual(b.checkWinner(), [tateti.A, tateti.D, tateti.G], "P1 Winner");
    });

    test("Wrong turn", function() {
        expect(1);

        var b = new tateti.Board();

        b.set(tateti.P1, tateti.A);
        raises(function() {
                b.set(tateti.P1, tateti.B);
            },
            "Wrong turn detected"
        );
    });

    test("Illegal set", function() {
        expect(1);

        var b = new tateti.Board();

        b.set(tateti.P1, tateti.A);
        raises(function() {
                b.set(tateti.P2, tateti.A);
            },
            "Illegal set detected"
        );
    });

});
