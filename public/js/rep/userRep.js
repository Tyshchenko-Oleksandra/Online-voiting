const db = require("./db");
const bcrypt = require("bcrypt");

class UserRep {

  async regist(login, password) {
    try {
      const [rows] = await db.query(
        "SELECT * FROM user WHERE login = ?",
        [login]
      );

      if (rows.length > 0) {
        return { success: false, message: "Логін уже використовується" };
      }

      const hashed = await bcrypt.hash(password, 10);

      await db.query(
        "INSERT INTO user (login, password, admin) VALUES (?, ?, 0)",
        [login, hashed]
      );

      return { success: true, message: "Користувач створений" };

    } catch (err) {
      console.error("Помилка при реєстрації:", err);
      return { success: false, message: "Помилка сервера" };
    }
  }

  async login(login, password) {
    try {
      const [rows] = await db.query(
        "SELECT * FROM user WHERE login = ?",
        [login]
      );

      if (rows.length === 0) {
        return { success: false, message: "Користувача не знайдено" };
      }
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return { success: false, message: "Невірний пароль" };
      }

      return {
        success: true,
        user: {
          id: user.id,
          login: user.login,
          admin: user.admin
        }
      };

    } catch (err) {
      console.error("Помилка при вході:", err);
      return { success: false, message: "Помилка сервера" };
    }
  }



}

module.exports = new UserRep();