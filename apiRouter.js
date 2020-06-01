// import express from "express";
const { Router } = require("express");
const router = Router();
const Joi = require("@hapi/joi");

const contacts = require("./contacts");

// Get all contacts
router.get("/contacts", async (req, res) => {
  try {
    const allContacts = await contacts.listContacts();
    return res.status(200).json(allContacts);
  } catch (error) {
    // res.sendStatus(400);
  }
});
//Get by Id
router.get("/contacts/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const contactFind = await contacts.getContactById(id);
    console.log(contactFind);
    if (contactFind) {
      return res.status(200).json(contactFind);
    }
    return res.status(404).json({ message: "Not found" });
  } catch (error) {}
});
// Create contacts
router.post("/contacts", validateCreateUser, async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    await contacts.addContact(name, email, phone);
    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

// Delete User

router.delete("/contacts/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const contactFind = await contacts.getContactById(id);
    console.log(contactFind);
    if (contactFind) {
      await contacts.removeContact(id);
      return res.status(200).json({ message: "contact deleted" });
    }
    return res.status(404).json({ message: "not found" });
    // res.send("hello world");
  } catch (error) {}
});
// Update user
router.patch("/contacts/:id", validateUpdateUser, async (req, res, next) => {
  try {
    const body = req.body;
    const id = Number(req.params.id);
    if (isEmpty(body)) {
      res.status(400).json({ message: "missing fields" });
    } else {
      const updatedUser = await contacts.updateContact(body, id);
      if (!updatedUser) {
        return res.status(404).json({ message: "user not found" });
      }
      return res.status(200).json(updatedUser);
    }
    //check for empty object
    function isEmpty(obj) {
      for (let key in obj) {
        return false;
      }
      return true;
    }
  } catch (error) {}
});

function validateCreateUser(req, res, next) {
  const body = req.body;
  const userRules = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
  });

  const validationResult = userRules.validate(body);
  if (validationResult.error) {
    return res.status(400).json(validationResult.error);
  }
  next();
}

function validateUpdateUser(req, res, next) {
  const body = req.body;
  const userRules = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
  });

  const validationResult = userRules.validate(body);

  if (validationResult.error) {
    return res.status(400).json(validationResult.error);
  }
  next();
}

module.exports = router;
