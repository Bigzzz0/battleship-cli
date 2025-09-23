
class GameUtils:
    RESET = "\033[0m"

    @staticmethod
    def ColorFront(color: str, data: str) -> str:
        '''
        args:
            color:
                สีที่จะเปลี่ยน มีโค๊ดสี ดังนี้
                Black = \033[30m
                RED = \033[31m
                GREEN = \033[32m
                Yellow = \033[33m
                Blue = \033[34m
                Purple = \033[35m
                SkyBlue = \033[36m
                White = \033[37m

            data:
                ข้อความที่จะเปลี่ยนสี
        returns:
            ข้อความที่เปลี่ยนสีแล้ว
        '''
        return color + data + GameUtils.RESET

    @staticmethod
    def parse_position(position_str: str) -> tuple:
        """
        Parses a position string (e.g., "A1", "J10") into (row, col) integers.
        """
        if not GameUtils.is_valid_position_format(position_str):
            raise ValueError(f"Invalid position format: {position_str}")

        col_char = position_str[0].upper()
        row_num_str = position_str[1:]

        col = ord(col_char) - ord('A')
        row = int(row_num_str) - 1
        return row, col

    @staticmethod
    def is_valid_position_format(position_str: str) -> bool:
        """
        Checks if a position string (e.g., "A1", "J10") is valid.
        """
        if not position_str or len(position_str) < 2 or len(position_str) > 3:
            return False

        col_char = position_str[0].upper()
        row_num_str = position_str[1:]

        if not ('A' <= col_char <= 'J'):
            return False
        if not row_num_str.isdigit():
            return False

        row_num = int(row_num_str)
        if not (1 <= row_num <= 10):
            return False
        
        return True