import unittest
from UnitTest.TestTool import TestTool
from UnitTest.TestBoard import TestBoard
from UnitTest.TestBattleShip import TestBattleShipGame


suite = unittest.TestLoader().loadTestsFromTestCase(TestTool)
unittest.TextTestRunner(verbosity=2).run(suite)

suite = unittest.TestLoader().loadTestsFromTestCase(TestBoard)
unittest.TextTestRunner(verbosity=2).run(suite)

suite = unittest.TestLoader().loadTestsFromTestCase(TestBattleShipGame)
unittest.TextTestRunner(verbosity=2).run(suite)