const express = require('express');
const router = express.Router();
const Users = require("../public/js/rep/userRep");
const VoteRep = require("../public/js/rep/voteRep");

router.post("/register", async (req, res) => {
  const { login, password } = req.body;

  try {
    const result = await Users.regist(login, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    req.session.user = result.user;

    return res.json(result);

  } catch (err) {
    console.error("Помилка API реєстрації:", err);
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
});


router.post('/login', async (req, res) => {
  const { login, password } = req.body;

  try {
    const result = await Users.login(login, password);
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    req.session.user = result.user;

    return res.json(result);

  } catch (err) {
    console.error("Помилка API логіну:", err);
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
});




const isAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Не авторизований" });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (!req.session.user?.admin) {
    return res.status(403).json({ success: false, message: "Немає доступу" });
  }
  next();
};





// ─── Петиції ─────────────────────────────────────────────────────────────────

router.post("/petition", isAuth, async (req, res) => {
  const { name, text, options } = req.body;
  const id = req.session.user.id;

  if (!name || !text || !options?.length || options.length < 2) {
    return res.status(400).json({ success: false, message: "Заповніть всі поля, мінімум 2 варіанти" });
  }

  try {
    // 1. Створюємо петицію
    const petitionResult = await VoteRep.create(id, name, text);
    if (!petitionResult.success) return res.status(500).json(petitionResult);

    const petitionId = petitionResult.id; // ← потрібно повертати id з create()

    // 2. Для кожного варіанту — створюємо відповідь і одразу зв'язуємо
    for (const option of options) {
      const answerResult = await VoteRep.createAnsver(option);
      if (!answerResult.success) return res.status(500).json(answerResult);

      const answerId = answerResult.id; // ← потрібно повертати id з createAnsver()

      await VoteRep.unity(petitionId, answerId);
    }

    return res.status(201).json({ success: true, message: "Петицію створено" });

  } catch (err) {
    console.error("Помилка:", err);
    return res.status(500).json({ success: false, message: "Помилка сервера" });
  }
});

// Верифікувати петицію (тільки адмін)
router.patch("/petition/:id/verify", isAdmin, async (req, res) => {
  const { id } = req.params;

  const result = await VoteRep.verification(id);
  return res.status(result.success ? 200 : 500).json(result);
});

// Оновити петицію
router.put("/petition/:id", isAuth, async (req, res) => {
  const { id } = req.params;
  const { name, text, options } = req.body;

  if (!name || !text || !options?.length || options.length < 2) {
    return res.status(400).json({ success: false, message: "Заповніть всі поля" });
  }

  try {
    // 1. Оновлюємо петицію
    const updateResult = await VoteRep.update(id, name, text);
    if (!updateResult.success) return res.status(500).json(updateResult);

    // 2. Видаляємо старі зв'язки і відповіді
    await db.query("DELETE FROM answer_to_petition WHERE petition = ?", [id]);

    // 3. Створюємо нові відповіді і зв'язуємо
    for (const option of options) {
      const answerResult = await VoteRep.createAnsver(option);
      if (!answerResult.success) return res.status(500).json(answerResult);
      await VoteRep.unity(id, answerResult.id);
    }

    return res.json({ success: true, message: "Петицію оновлено" });

  } catch (err) {
    console.error("Помилка оновлення:", err);
    return res.status(500).json({ success: false, message: "Помилка сервера" });
  }
});
// Видалити петицію
router.delete("/petition/:id", isAuth, async (req, res) => {
  const { id } = req.params;

  const result = await VoteRep.delete(id);
  return res.status(result.success ? 200 : 500).json(result);
});


router.get("/petition/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await VoteRep.getPetitionById(id);
    return res.status(result.success ? 200 : 500).json({
      ...result,
      alreadyVoted: req.session.user
        ? await VoteRep.checkVote(req.session.user.id, id)
        : false,
      isAuth: !!req.session.user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Помилка сервера" });
  }
});

router.post("/petition/:id/vote", isAuth, async (req, res) => {

  console.log('req.body:', req.body);
console.log('typeof answerId:', typeof req.body.answerId);

  const { id } = req.params;
  const { answerId } = req.body;
  const userId = req.session.user.id;

  console.log("vote data:", { userId, id, answerId }); 

  const result = await VoteRep.vote(userId, id, answerId);
  return res.status(result.success ? 200 : 500).json(result);
});


router.get("/petitions", async (req, res) => {
  try {
    const result = await VoteRep.viewPetition();
    return res.status(result.success ? 200 : 500).json(result);
  } catch (err) {
    console.error("Помилка /api/petitions:", err);
    return res.status(500).json({ success: false, message: "Помилка сервера" });
  }
});

// ─── Відповіді ────────────────────────────────────────────────────────────────

// Створити відповідь
router.post("/answer", isAdmin, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: "Вкажіть name" });
  }

  const result = await VoteRep.createAnsver(name);
  return res.status(result.success ? 201 : 500).json(result);
});


router.get("/answer", isAuth, async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ success: false, message: "Вкажіть name" });
  }

  const result = await VoteRep.searchAnswer(name);
  return res.status(result.success ? 200 : 500).json(result);
});

// ─── Зв'язок петиції з відповіддю ────────────────────────────────────────────

// Прив'язати відповідь до петиції
router.post("/petition/:idPetition/answer/:idAnswer", isAdmin, async (req, res) => {
  const { idPetition, idAnswer } = req.params;

  const result = await VoteRep.unity(idPetition, idAnswer);
  return res.status(result.success ? 201 : 500).json(result);
});



router.get("/petitions/pending", isAdmin, async (req, res) => {
  const result = await VoteRep.ViewNonApruve();
  return res.status(result.success ? 200 : 500).json(result);
});


router.get(
  "/petitions/by-author/:login",
  isAuth,
  async (req, res) => {
    try {
      const { login } = req.params;
      const result = await VoteRep.viewAutors(login);
      return res
        .status(result.success ? 200 : 500)
        .json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }
);






module.exports = router;

