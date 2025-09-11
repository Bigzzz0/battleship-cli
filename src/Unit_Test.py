import unittest
from UnitTest.TestBattleShip import TestBattleShipGame
from UnitTest.TestBoard import TestBoard
from UnitTest.TestTool import TestTool

Test_Board = unittest.TestLoader().loadTestsFromTestCase(TestBoard)
unittest.TextTestRunner(verbosity=2).run(Test_Board)

Test_Tool = unittest.TestLoader().loadTestsFromTestCase(TestTool)
unittest.TextTestRunner(verbosity=2).run(Test_Tool)

Test_BattleShip = unittest.TestLoader().loadTestsFromTestCase(TestBattleShipGame)
unittest.TextTestRunner(verbosity=2).run(Test_BattleShip)