const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const Repository = require("./repository");

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
  async create(attributes) {
    attributes.id = this.randomID();
    const salt = crypto.randomBytes(8).toString("hex");
    const buf = await scrypt(attributes.password, salt, 64);
    const records = await this.getAll();
    const record = {
      ...attributes,
      password: `${buf.toString("hex")}.${salt}`,
    };
    records.push(record);
    await this.writeAll(records);
    return record;
  }
  async comparePasswords(saved, supplied) {
    // Saved -> password stored in my database. (hashed.salt)
    // Supplied -> password given by user.
    //
    // If you use the following line of code to replace the next 3 under it,
    // then the error message returned from this async function inside the log will be 'undefined'
    // instead of the intended behavior of throwing an appropriate error message defined during authentication.
    // I have no fucking idea how it works for him in the course.
    // This is from Section 28, video 383.
    //
    // const [hashed, salt] = saved.split(".");
    //
    // I guess destructuring an array does not work...???
    const result = saved.split(".");
    const hashed = result[0];
    const salt = result[1];

    const hashedSuppliedBuf = await scrypt(supplied, salt, 64);
    return hashed === hashedSuppliedBuf.toString("hex");
  }
}

module.exports = new UsersRepository("users.json");
