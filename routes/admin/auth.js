const express = require("express");

const usersRepo = require("../../repositories/users");
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");
const {
  requireEmail,
  requirePassword,
  requirePasswordConfirmation,
  requireEmailExists,
  requireValidPasswordForUser,
} = require("./validators");
const { handleErrors } = require("./middlewares");

const signin = require("../../views/admin/auth/signin");

const router = express.Router();

router.get("/signup", (request, response) => {
  response.send(signupTemplate({ request }));
});

router.post(
  "/signup",
  [requireEmail, requirePassword, requirePasswordConfirmation],
  handleErrors(signupTemplate),
  async (request, response) => {
    const { email, password } = request.body;
    const user = await usersRepo.create({ email, password });
    request.session.userID = user.id;
    response.redirect("/admin/products");
  }
);

router.get("/signout", (request, response) => {
  request.session = null;
  response.send("You are logged out.");
});

router.get("/signin", (request, response) => {
  response.send(signinTemplate({}));
});

router.post(
  "/signin",
  [requireEmailExists, requireValidPasswordForUser],
  handleErrors(signinTemplate),
  async (request, response) => {
    const { email } = request.body;
    const user = await usersRepo.getOneBy({ email });
    request.session.userID = user.id;
    response.redirect("/admin/products");
  }
);

module.exports = router;
