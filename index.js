var commander = require('commander'),
    colors = require('colors'),
    _ = require('underscore'),
    ncp = require('ncp').ncp,
    TransformStream = require('./transformStream'),
    fs = require('fs');


var progress = 0,
    schema = [
        {
            name: 'appTitle',
            question: 'What is the human friendly title of your app? For example: "My Awesome App"',
            prompt: 'Application Title',
            test: function (answer) {
                if (answer) {
                    return answer;
                }
            },
            message: 'Required'
        },
        {
            name: 'appName',
            question: 'What should the main app controller be called?\nThis gets used as the "name" field in package.json and in the base HTML sent to the browser:\n\n' + '<!DOCTYPE html>\n<script src="'.blue + 'appName'.white + '.js"></script>\n'.blue,
            prompt: 'Short app name',
            test: function (answer) {
                if (/^[a-zA-Z\.\_\-]+$/.test(answer)) {
                    return answer;
                }
            },
            message: 'No whitespace or other characters, please. Just letters.'
        },
        {
            name: 'appDescription',
            question: 'Optionally, write a short description of your app.',
            prompt: 'app description',
            test: function (answer) {
                if (!answer) return '';
                answer = answer.replace('"', '\\"');
                return answer || '';
            },
            message: 'No whitespace or other characters, please. Just letters.'
        },
        {
            name: 'port',
            question: 'What port should it run on in development? Defaults to 3000',
            prompt: 'Port number to run on',
            test: function (answer) {
                if (!answer) answer = '3000';
                if (/^[0-9]{2,5}$/.test(answer)) {
                    return answer;
                }
            },
            message: 'Must be a number two to five digits long'
        },
        {
            name: 'authorName',
            question: 'What\'s your name? Used to populate "author" field of "package.json"' + '\n\n{\n  "name": "app",\n  "version": "0.0.1",\n  "author": "'.blue + 'Your Name' + ' <your@email>",\n  "dependencies": ...\n}\n'.blue,
            prompt: 'Name',
            test: function (answer) {
                if (answer) {
                    return answer;
                }
            },
            message: 'Required'
        },
        {
            name: 'authorEmail',
            question: 'What\'s your email? Also used to populate "author" field of "package.json"' + '\n\n{\n  "name": "app",\n  "version": "0.0.1",\n  "author": "Your Name <'.blue + 'your@email' + '>",\n  "dependencies": ...\n}\n'.blue,
            prompt: 'Email',
            test: function (answer) {
                if (answer) {
                    return answer;
                }
            },
            message: 'Required'
        },
        {
            name: 'projectFolder',
            question: 'What do you want to name the project folder that we\'ll create?',
            prompt: 'Project folder name',
            test: function (answer) {
                if (answer) {
                    return answer;
                }
            },
            message: 'Required'
        },
    ],
    result = {};


function buildQuestion(index) {
    var desc = schema[index],
        str;

    if (desc) {
        str = '\n' + (desc.question).green + '\n' + (desc.prompt + ':').grey + ' ';
        commander.prompt(str, function (answer) {
            var testedAnswer = desc.test(answer);
            if (typeof testedAnswer === 'string') {
                desc.answer = testedAnswer;
                progress++
            } else {
                console.log(("\nerror: " + desc.message).red);
            }
            buildQuestion(progress);
        });
    } else {
        schema.forEach(function (item) {
            result[item.name] = item.answer;
        });

        ncp(__dirname + '/template', result.projectFolder, {
            transform: function (readable, writeable, file) {
                var transform = new TransformStream(result);
                readable.pipe(transform).pipe(writeable);
            },
            clobber: true
        }, function (err) {
            if (!err) {
                console.log('\n\n' + (result.appTitle.bold + ' was created!\n').green);
                console.log('now cd to it:\n\n' + ('    $ cd ' + result.projectFolder).grey + '\n\ninit your git repo:\n\n' + '    $ git init'.grey + '\n\ninstall dependencies:\n\n' + '    $ npm i'.grey + '\n\nand run it:\n\n' + '    $ node server'.grey + '\n');
                process.stdin.destroy();
            } else {
                console.log('error:'.red, err);
            }
        });
    }
}

buildQuestion(progress);
