var prompt = require('prompt');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('tasks.db');

var container = {};
function on(event_name, callback){
    container[event_name] = callback;//заносим в объект имя свойства и его значение - функцию
}
function trigger(event_name){//па уласцивасци выкликаем
    container[event_name]();//выводит значение св-ва контейнера (функцию)
}

function help(){
    console.log('Hi! I am little to-do list app. You can use next commands:\n' +
    'list - show all your task\n' +
    'add - add task \n' +
    'complete - mark task as completed \n' +
    'list incomplete - show only incomplete tasks \n' +
    'exit - just exit\n' +
    'help - show this menu\n'
    );
    showMenu();

}

function listTasks() {
    db.all('select * from tasks', function (err, task) {
        task.forEach(function (tasks) {
            console.log(tasks.id + ' ' + tasks.name + ": " + (tasks.status == 1 ? 'done' : ''));
        });
        trigger('tasks_listed');
    });
}

    function listIncomplete() {
        db.all('select * from tasks where status = 0', function (err, task) {
            task.forEach(function (tasks) {
                console.log(tasks.id + ' ' + tasks.name);
            });
            trigger('uncompleted_tasks_listed');
        });
    }

    function addTask(name){
        db.run('insert into tasks (name, status) values ( "' + name +'", 0)',
            function(err, contacts){
            trigger('task_added');
        })

    }

    function completeTask(id) {
        db.run('update tasks set status = 1 where id =' + id,
            function (err, contacts) {
                trigger('task_completed');
            });
    }


    var showMenu = function() {
        prompt.get(['command'],function commands(err, result) {
            if (result.command == 'list') {
                listTasks();

            } else if (result.command == 'add') {
                prompt.get(['name'], function (err, nameResult) {
                    addTask(nameResult.name);
                    on('task_added', listTasks);
                })
            } else if (result.command == 'complete') {
                prompt.get(['id'], function (err, idResult) {
                    completeTask(idResult.id);
                    on('task_completed', listTasks);
                })
            } else if (result.command == 'list incomplete') {
                listIncomplete();
                on('uncompleted_tasks_listed', showMenu)

            }else if (result.command == 'exit'){
                console.log('Bye bye!')
            }
            else if (result.command == 'help'){
                help();
            }
            else {
                console.log('Incorrect command');
                showMenu();
            }

        })
    };

help();
    on('tasks_listed', showMenu);






