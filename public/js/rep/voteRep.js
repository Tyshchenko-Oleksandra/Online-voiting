const db = require("./db");

class VoteRep {
    async create(id, name, text) {
  try {
    const [result] = await db.query(
      "INSERT INTO petition(name, text, status, author) VALUES (?, ?, 0, ?)",
      [name, text, id]
    );
    return { success: true, message: "петиція створена", id: result.insertId };
  } catch (err) {
    console.error("Помилка при створені петиції:", err);
    return { success: false, message: "Помилка сервера" };
  }
}

    async createAnsver(answer) {
  try {
    const [result] = await db.query(
      "INSERT INTO answers (name) VALUES (?)",
      [answer]
    );
    return { success: true, message: "відповідь створена", id: result.insertId };
  } catch (err) {
    console.error("Помилка при створені відповіді:", err);
    return { success: false, message: "Помилка сервера" };
  }
}

    async unity(idPetition, idAnswer){
        try{
            await db.query("INSERT INTO answer_to_petition (petition, answer, num_of_vote) VALUES (?, ?, 0)",[idPetition, idAnswer]);

            return { success: true, message: "відповідь звязана" };

    } catch (err) {
      console.error("Помилка при створені відповіді:", err);
      return { success: false, message: "Помилка сервера" };
    }
  }

    async verification(id){
    try{
            await db.query("UPDATE petition SET status= 1 WHERE id = ?", [id]);
            return { success: true, message: "петиція верифікована" };

    } catch (err) {
      console.error("Помилка при верифікації:", err);
      return { success: false, message: "Помилка сервера" };
    }
  }

    async delete(id){
        try{
                await db.query("DELETE FROM answer_to_petition WHERE petition = ?",[id])
                await db.query("DELETE FROM petition WHERE id=?", [id]);
                return { success: true, message: "петиція видалина" };

         } catch (err) {
          console.error("Помилка при видалині петиції:", err);
          return { success: false, message: "Помилка сервера" };
    }
  }

    async update(idPetition, name, text){
      try{
                await db.query("UPDATE petition SET name = ?, text = ?, status = 0 WHERE id = ?", [name, text, idPetition]);
                return { success: true, message: "петиція оновлена" };

         } catch (err) {
          console.error("Помилка при оновлені петиції:", err);
          return { success: false, message: "Помилка сервера" };
    }
  }

    async searchAnswer(name){
      try {
          const[answers] =  await db.query("SELECT * FROM answers WHERE name = ?", [name]);
            return {
        success: true,
        answer: {
          id: answers.id,
          login: answers.name
        }};
      }
       catch (err) {
          console.error("Помилка при оновлені петиції:", err);
          return { success: false, message: "Помилка сервера" };
        }
      
    }



    async viewPetition() {
  try {
    const [rows] = await db.query("SELECT * FROM petition WHERE status = 1");
    return {
      success: true,
      petitions: rows.map(row => ({
        id: row.id,
        name: row.name,
        text: row.text,
        author: row.author
      }))
    };
  } catch (err) {
    console.error("Помилка при отриманні петицій:", err);
    return { success: false, message: "Помилка сервера" };
  }
}

async getPetitionById(id) {
  try {
    const [[petition]] = await db.query(
      "SELECT p.id, p.name, p.text, p.status, u.login FROM petition AS p JOIN user AS u ON p.author = u.id WHERE p.id = ?",
      [id]
    );
    if (!petition) return { success: false, message: "Петицію не знайдено" };

    const [answers] = await db.query(
      "SELECT ATP.answer AS answerId, A.name, ATP.num_of_vote FROM answer_to_petition AS ATP JOIN answers AS A ON ATP.answer = A.id WHERE ATP.petition = ?",
      [id]
    );

    return { success: true, petition: { ...petition, answers } };
  } catch (err) {
    console.error("Помилка getPetitionById:", err);
    return { success: false, message: "Помилка сервера" };
  }
}


  async checkVote(userID, petitionID){
    try{
      const [rows] = await db.query("SELECT * FROM users_to_answer WHERE user = ?  and petition = ?", [userID, petitionID]);
      return rows.length > 0;
    }
    catch (err) {
    return false;
  }
  }

  async vote(userID, petitionID, answerID){
    try{
      await db.query("INSERT INTO users_to_answer(user, answer, petition) VALUES (?, ?, ?)", [userID, answerID, petitionID]);
      await db.query("UPDATE answer_to_petition SET num_of_vote = num_of_vote + 1 WHERE petition = ? AND answer = ?", [petitionID, answerID]);
       return { success: true, message: "Голос враховано" };
    }
    catch (err) {
    console.error("Помилка vote:", err);
    return { success: false, message: "Помилка сервера" };
  }
  }


  async ViewNonApruve(){
    try {
    const [rows] = await db.query(" select  p.id, p.name, p.text, p.status, u.login FROM petition AS p join user AS u on p.author = u.id  where status = 0");
     return {
      success: true,
      petitions: rows.map(row => ({
        id: row.id,
        name: row.name,
        text: row.text,
        author: row.login
      }))
  }
  }
  catch (err) {
    console.error("Помилка vote:", err);
    return { success: false, message: "Помилка сервера" };
  }}
  

async viewAutors(login) {

  try {

    const [rows] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.text,
        p.status,
        u.login
      FROM petition AS p
      JOIN user AS u
        ON p.author = u.id
      WHERE u.login = ?
    `, [login]);
    return {
      success: true,
      petitions: rows.map(row => ({
        id: row.id,
        name: row.name,
        text: row.text,
        status: Number(row.status),
        author: row.login
      }))
    };

  } catch (err) {
    console.error('viewAutors error:', err);
    return {
      success: false,
      message: 'Помилка сервера'
    };
  }
}

catch (err) {
    console.error("Помилка vote:", err);
    return { success: false, message: "Помилка сервера" };
  }
}
module.exports = new VoteRep();