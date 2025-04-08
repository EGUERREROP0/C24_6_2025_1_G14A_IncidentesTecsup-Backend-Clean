import bcrypt, { compareSync } from "bcrypt";

export class Bcrypt {
  static hash = (password: string) => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  };

  static compare = (password: string, hashed: string) => {
    return compareSync(password, hashed);
  };
}
