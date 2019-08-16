//function returns base64 dec value
export function getDecFrom64(c) {
  var result;
  switch (c) {
    //ascii 0
    case 48:
      result = 52;
      break;
    //ascii 1
    case 49:
      result = 53;
      break;
    //ascii 2
    case 50:
      result = 54;
      break;
    //ascii 3
    case 51:
      result = 55;
      break;
    //ascii 4
    case 52:
      result = 56;
      break;
    //ascii 5
    case 53:
      result = 57;
      break;
    //ascii 6
    case 54:
      result = 58;
      break;
    //ascii 7
    case 55:
      result = 59;
      break;
    //ascii 8
    case 56:
      result = 60;
      break;
    //ascii 9
    case 57:
      result = 61;
      break;
    //ascii 65-90 = A-Z
    //ascii A
    case 65:
      result = 0;
      break;
    //ascii B
    case 66:
      result = 1;
      break;
    //ascii C
    case 67:
      result = 2;
      break;
    //ascii D
    case 68:
      result = 3;
      break;
    //ascii E
    case 69:
      result = 4;
      break;
    //ascii F
    case 70:
      result = 5;
      break;
    //ascii G
    case 71:
      result = 6;
      break;
    //ascii H
    case 72:
      result = 7;
      break;
    //ascii I
    case 73:
      result = 8;
      break;
    //ascii J
    case 74:
      result = 9;
      break;
    //ascii K
    case 75:
      result = 10;
      break;
    //ascii L
    case 76:
      result = 11;
      break;
    //ascii M
    case 77:
      result = 12;
      break;
    //ascii N
    case 78:
      result = 13;
      break;
    //ascii O
    case 79:
      result = 14;
      break;
    //ascii P
    case 80:
      result = 15;
      break;
    //ascii Q
    case 81:
      result = 16;
      break;
    //ascii R
    case 82:
      result = 17;
      break;
    //ascii S
    case 83:
      result = 18;
      break;
    //ascii T
    case 84:
      result = 19;
      break;
    //ascii U
    case 85:
      result = 20;
      break;
    //ascii V
    case 86:
      result = 21;
      break;
    //ascii W
    case 87:
      result = 22;
      break;
    //ascii X
    case 88:
      result = 23;
      break;
    //ascii Y
    case 89:
      result = 24;
      break;
    //ascii Z
    case 90:
      result = 25;
      break;
    //ascii a-z, 97-122
    //ascii a
    case 97:
      result = 26;
      break;
    //ascii b
    case 98:
      result = 27;
      break;
    //ascii c
    case 99:
      result = 28;
      break;
    //ascii d
    case 100:
      result = 29;
      break;
    //ascii e
    case 101:
      result = 30;
      break;
    //ascii f
    case 102:
      result = 31;
      break;
    //ascii g
    case 103:
      result = 32;
      break;
    //ascii h
    case 104:
      result = 33;
      break;
    //ascii i
    case 105:
      result = 34;
      break;
    //ascii j
    case 106:
      result = 35;
      break;
    //ascii k
    case 107:
      result = 36;
      break;
    //ascii l
    case 108:
      result = 37;
      break;
    //ascii m
    case 109:
      result = 38;
      break;
    //ascii n
    case 110:
      result = 39;
      break;
    //ascii o
    case 111:
      result = 40;
      break;
    //ascii p
    case 112:
      result = 41;
      break;
    //ascii q
    case 113:
      result = 42;
      break;
    //ascii r
    case 114:
      result = 43;
      break;
    //ascii s
    case 115:
      result = 44;
      break;
    //ascii t
    case 116:
      result = 45;
      break;
    //ascii u
    case 117:
      result = 46;
      break;
    //ascii v
    case 118:
      result = 47;
      break;
    //ascii w
    case 119:
      result = 48;
      break;
    //ascii x
    case 120:
      result = 49;
      break;
    //ascii y
    case 121:
      result = 50;
      break;
    //ascii z
    case 122:
      result = 51;
      break;
    //ascii +
    case 43:
      result = 62;
      break;
    //ascii /
    case 47:
      result = 63;
      break;
  }

  return result;
}

