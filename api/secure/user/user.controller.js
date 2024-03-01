import * as service from "./user.service.js";

export const updateUser = async (req, res) => {
  const { name } = req.body;
  const { id } = req.user;

  try {
    const success = await service.updateUser(name, id);
    res.json({ success });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const token = await service.register(name, email, password);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};
