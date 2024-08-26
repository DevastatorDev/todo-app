const express = require("express");
const fs = require("fs/promises");

const app = express();

const PORT = 3000;

app.use(express.json());

const filePath = "./todos.json";

let todos = [];
let todoId = 0;

const init = async () => {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    todos = JSON.parse(data);
    todoId = todos.length > 0 ? todos[todos.length - 1].id + 1 : 0;
  } catch (err) {
    if (err.code === "ENOENT") {
      // File does not exist, create it with an empty array
      await fs.writeFile(filePath, JSON.stringify([]));
    } else {
      console.error("Error reading the file:", err);
    }
  }
};

const saveTodos = async () => {
  try {
    await fs.writeFile(filePath, JSON.stringify(todos, null, 2));
  } catch (err) {
    console.error("Error writing the file:", err);
  }
};

app.get("/", (req, res) => {
  res.json(todos);
});

app.get("/get-todo/:id", (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    res.json({ todo });
  } else {
    res.status(404).json({ msg: "Todo not found" });
  }
});

app.post("/add-todo", (req, res) => {
  const { title, description } = req.body;
  const todo = {
    id: todoId++,
    title,
    description,
  };
  todos.push(todo);
  saveTodos();
  res.json({ msg: "Todo added successfully" });
});

app.put("/update-todo/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, description } = req.body;
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.title = title;
    todo.description = description;
    saveTodos();
    res.json({ msg: "Todo updated successfully" });
  } else {
    res.status(404).json({ msg: "Todo not found" });
  }
});

app.delete("/delete-todo/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = todos.findIndex((t) => t.id === id);
  if (index !== -1) {
    todos.splice(index, 1);
    saveTodos();
    res.json({ msg: "Todo deleted successfully" });
  } else {
    res.status(404).json({ msg: "Todo not found" });
  }
});

app.listen(PORT, async () => {
  await init();
  console.log(`Server started on port ${PORT}`);
});
