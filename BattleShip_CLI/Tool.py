RESET = "\033[0m"
def ColorFront(color:str,data:str)->str:
    '''
    args:
        color:
            สีที่จะเปลี่ยน มีโค๊ดสี ดังนี้
            Black = \\033[30m
            RED = \\033[31m
            GREEN = \\033[32m
            Yellow = \\033[33m
            Blue = \\033[34m
            Purple = \\033[35m
            SkyBlue = \\033[36m
            White = \\033[37m

        data:
            ข้อความที่จะเปลี่ยนสี
    returns:
        ข้อความที่เปลี่ยนสีแล้ว
    '''
    return color+data+RESET

def parse_position(pos1:str, pos2:str)->tuple:
    '''
    if pos1 = str than pos2 = int
    or pos2 = int than pos1 = str\n
    RETURN (int,int)
    '''
    # If pos1 is a letter, it's the column; if it's a digit, it's the row
    if pos1.isalpha():
        col = ord(pos1.upper()) - ord('A')
        row = int(pos2) - 1
    else:
        row = int(pos1) - 1
        col = ord(pos2.upper()) - ord('A')
    return row, col

def is_valid_position(pos1:str, pos2:str)->bool:
    '''
        check if pos1 and pos2 are valid (A-J and 1-10)
    '''
    if pos1.isalpha():
        if len(pos1) != 1:
          return False
        if pos1.upper() < 'A' or pos1.upper() > 'J':
            return False
        if not pos2.isdigit() or int(pos2) < 1 or int(pos2) > 10:
            return False
    elif pos1.isdigit():
        if len(pos2) != 1:
          return False
        if int(pos1) < 1 or int(pos1) > 10:
            return False
        if not pos2.isalpha() or pos2.upper() < 'A' or pos2.upper() > 'J':
            return False
    else:
        return False
    return True