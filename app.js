const express = require('express')
const app = express()
const path = require('path')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const jsonfile = require('jsonfile')
const file = './temp/data.json'

app.engine('mustache', mustacheExpress());
app.set('views', './views')
app.set('view engine', 'mustache')
app.use(express.static(path.join(__dirname, 'static')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressValidator())

const todoList = [];

app.get('/', home)

function home(req, res, next) {
  if (req.errors) {
    jsonfile.readFile(file, function (err, todoList) {
      res.render('index', { errors: req.errors, todoList })
    })

  } else {
    jsonfile.readFile(file, function (err, todoList) {
      res.render('index', { todoList })
    })

  }
}
app.post('/', addTodo, home)

// Adding a new todo
function addTodo(req, res, next) {
  req.checkBody("addTodo", "Can't enter a blank todo").notEmpty();
  req.getValidationResult().then(function (result) {
    var errors = result.useFirstErrorOnly().array();
    if (errors.length > 0) {
      req.errors = errors
      next()
    }
    else {
      jsonfile.readFile(file, function (err, todoList) {
       todoList.push({ description: req.body.addTodo, complete: false })
        jsonfile.writeFileSync(file, todoList)
        res.render('index', { todoList })
      })

    }
  })
}
// Completed a todo
app.post('/completed', markCompleted, home)

function markCompleted(req, res, next) {

  jsonfile.readFile(file, function (err, todoList) {
    todoList.forEach(function (item) {
      if (item.description === req.body.complete) {
        item.complete = true;
      }
    })
    //update json file
    jsonfile.writeFileSync(file, todoList)
    res.redirect('/')
  })
}


app.listen(3000, function () {
  console.log("App running on port 3000")
})