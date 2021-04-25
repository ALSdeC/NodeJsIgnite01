const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((x) => x.username === username);

  if(!user) return response.status(400).json({error: 'Costumer not found'});
  
  request.user = user;
  return next();
}

app.get('/users', (request, response) => {
  return response.status(201).json(users);
});

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const existsUser = users.some((x) => x.username === username);
  if(existsUser)
    return response.status(400).json({error: 'The user already exists!'});

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;
  //const user = users.find((x) => x.todos.find((y) => y.id === id));
  //const todo = user.todos.find((x) => x.id === id);
  const todo = user.todos.find((x) => x.id === id);
  if(!todo) return response.status(404).json({error: "Not be able to update todo"});

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((x) => x.id === id);
  if(!todo) return response.status(404).json({error: "Not be able to update todo"});

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex((x) => x.id === id);
  if(todoIndex > -1)
    user.todos.splice(todoIndex, 1);
  else
    return response.status(404).json({error: "Not be able to delete the todo"});

  return response.status(204).send();
});

module.exports = app;