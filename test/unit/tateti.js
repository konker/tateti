$(document).ready(function() {
    module("Module tateti.js");

    test("Board OK", function() {
        //expect(10);

        var b = new tateti.Board();
        equals(b.toString(),
               "-----------------\n"  +
               "|  .  |  .  |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               " -----------------",
        "Empty board");

        b.set(tateti.P11, tateti.A);
        equals(b.toString(),
               "-----------------\n"  +
               "| P11 |  .  |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               " -----------------",
        "Move 1");

        b.set(tateti.P21, tateti.B);
        equals(b.toString(),
               "-----------------\n"  +
               "| P11 | P21 |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               " -----------------",
        "Move 2");

        b.set(tateti.P12, tateti.D);
        equals(b.toString(),
               "-----------------\n"  +
               "| P11 | P21 |  .  |\n" +
               "| P12 |  .  |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               " -----------------",
        "Move 3");

        b.set(tateti.P22, tateti.E);
        equals(b.toString(),
               "-----------------\n"  +
               "| P11 | P21 |  .  |\n" +
               "| P12 | P22 |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               " -----------------",
        "Move 4");

        b.set(tateti.P13, tateti.H);
        equals(b.toString(),
               "-----------------\n"  +
               "| P11 | P21 |  .  |\n" +
               "| P12 | P22 |  .  |\n" +
               "|  .  | P13 |  .  |\n" +
               " -----------------",
        "Move 5");

        b.set(tateti.P23, tateti.I);
        equals(b.toString(),
               "-----------------\n"  +
               "| P11 | P21 |  .  |\n" +
               "| P12 | P22 |  .  |\n" +
               "|  .  | P13 | P23 |\n" +
               " -----------------",
        "Move 6");

        b.move(tateti.H, tateti.G);
        equals(b.toString(),
               "-----------------\n"  +
               "| P11 | P21 |  .  |\n" +
               "| P12 | P22 |  .  |\n" +
               "| P13 |  .  | P23 |\n" +
               " -----------------",
        "Move 7");

        ok(b.gameOver, "Game over");

        deepEqual(b.checkWinner(), { "win": [tateti.A, tateti.D, tateti.G], "winner": "P1" }, "P1 Winner");
    });

    test("Undo", function() {
        //expect(10);

        var b = new tateti.Board();
        equals(b.toString(),
               "-----------------\n"  +
               "|  .  |  .  |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               " -----------------",
        "Empty board");

        b.set(tateti.P11, tateti.A);
        equals(b.toString(),
               "-----------------\n"  +
               "| P11 |  .  |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               " -----------------",
        "Move 1");

        b.set(tateti.P21, tateti.B);
        equals(b.toString(),
               "-----------------\n"  +
               "| P11 | P21 |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               " -----------------",
        "Move 2");

        b.undo();
        equals(b.toString(),
               "-----------------\n"  +
               "| P11 |  .  |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               "|  .  |  .  |  .  |\n" +
               " -----------------",
        "Undo");
    });

    test("Wrong turn", function() {
        expect(1);

        var b = new tateti.Board();

        b.set(tateti.P11, tateti.A);
        raises(function() {
                b.set(tateti.P11, tateti.B);
            },
            "Wrong turn detected"
        );
    });

    test("Illegal set", function() {
        expect(1);

        var b = new tateti.Board();

        b.set(tateti.P11, tateti.A);
        raises(function() {
                b.set(tateti.P21, tateti.A);
            },
            "Illegal set detected"
        );
    });

});
