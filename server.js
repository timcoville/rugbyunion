const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const SocketIO = require('socket.io');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-as-promised');
const dateFormat = require('dateformat');

mongoose.connect('mongodb://localhost/rugby');
require('mongoose-type-email');

app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, './public/dist/ang-sockets')));

var EventSchema = new mongoose.Schema ({
    title: {type: String, required: true},
    type: {type: String, required: true},
    startTime: {type: Date, required: true},
    location: {type: String, required: true, minlength: 5},
    address: {
        street: {type: String, required: true},
        city: {type: String, required: true},
        state: {type: String, required: true},
        zip: {type: String, required: true}
    },
    attending: []
}, {timestamps: true});


var UserSchema = new mongoose.Schema ({
    firstName: {
        type: String,
        required: [true, "First Name required"],
        minlength: [3, "First Name needs to be longer than 3 characters"]
    },
    lastName: {
        type: String,
        required: [true, "Last Name required"],
        minlength: [3, "Last Name needs to be longer than 3 characters"]
    },
    email: {type: mongoose.SchemaTypes.Email, required: [true, "Email required"]},
    password: {type: String, required: [true, "Password required"]},
    position: String,
    height: {
        feet: Number,
        inches: Number
    },
    weight: Number,
    dob: String,
    payments: [],
    completed: false,
    authority: {
        type: Number,
        required: true,
        default: 0
    }
}, {timestamps: true});

const User = mongoose.model('User', UserSchema)
const Event = mongoose.model('Event', EventSchema)

connections = {};


app.post('/api/register2', (req, res)=>{
    User.find({email: req.body.email}, (err, user) => {
        err = [];
        if (user.length != 0) {
            err.push("Email already exsits")
        }    
        if(req.body.password.length < 5){
            err.push('Password needs to be 5 characters or more')
        }
        if(req.body.password != req.body.cPassword){
            err.push('Passwords do not match')
        }
        if (req.body.firstName.length < 3){
            err.push('First name needs to be longer than 3 characters')
        }
        if (req.body.lastName.length < 3){
            err.push('Last name needs to be longer than 3 characters')
        }
        if (err.length > 0) {
            res.json({'errors': err});
        } else {
            user = new User();
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.email = req.body.email;
            bcrypt.hash(req.body.password, 10)
                .then(hashed_password =>{
                        user.password = hashed_password;
                        user.save((err, newUser) => {
                            if(err){
                                res.json({'errors': err.errors});
                            }
                            else{
                                console.log("success");
                                res.json(newUser);
                            }
                        });
                })
                .catch(err => {
                        console.log("errors", err);
                });
            }
    });
});
/* 
app.post('/api/register', (req, res)=>{
    err = []
    if(req.body.password.length < 5){
        err.push('Password needs to be longer than 5 characters')
        res.json({'error': err});
    }
    else{
        if(req.body.password === req.body.cPassword){
            User.find({email: req.body.email}, (err, user) => {
                if(user.length == 0){
                    user = new User();
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName;
                    user.email = req.body.email;
                    bcrypt.hash(req.body.password, 10)
                        .then(hashed_password =>{
                            user.password = hashed_password;
                            user.save((err, newUser) => {
                                if(err){
                                    res.json({'error': err.errors});
                                }
                                else{
                                    console.log("success");
                                    /* bcrypt.hash(newUser._id, 10) 
                                    res.json(newUser)
                                }
                            });
                        })
                        .catch(err => {
                            console.log("hash", err);
                        });
                    }
                else{
                    err = {
                        email: 'Email already exists'
                    };
                    res.json({'error': err});
                }
            });
        }
        else{
            err = {
                password: 'Passwords do not match'
            };
            res.json({'error': err });
        }
    }
}); */

app.post('/api/login', (req, res)=>{
    User.findOne({email:req.body.email}, (err, user)=>{
        err = [];
        if(!user){
            err.push('Email not found');
            res.json({'error': err });
        }
        else{
            console.log("User", user);
            bcrypt.compare(req.body.password, user.password)
                .then(result => {
                    res.json(user);
                })
                .catch(error => {
                    err.push('Password invalid');
                    res.json({'error': err });
                });
        }   
    });
});

app.post('/api/events', (req, res)=>{
    now = new Date().toISOString();
    err = []
    console.log(req.body)
    if (now > req.body.startTime){
        err.push("Event must be a future date");
    }
    if (req.body.title.length < 8){
        err.push("Title must be greater than 8 characters");
    }
    if (req.body.location.length < 3) {
        err.push("Location must be greater than 3 characters");
    }
    if (req.body.address.city.length == 0 ){
        err.push("Address is required");
    }
    if (req.body.address.state == "State" ){
        err.push("State is required");
    }
    if (req.body.type == "Event Type" ){
        err.push("Event Type is required");
    }
    if (req.body.address.zip.length == 0 ){
        err.push("Zipcode is required");
    } else { 
        if (req.body.address.zip.length != 5 ){
            err.push("Valid Zipcode required");
        }
    }
    if (err.length > 0){
        res.json({"errors": err});
    } else {
        Event.create(req.body, (err, event)=>{
            if(err){
                console.log(err)
            }
            else{
                res.json(event)
            }
        })
    }
});

app.get('/api/players/:id', (req, res)=>{
    User.findOne({_id: req.params.id}, (err, data)=>{
        if(err){
            res.json(err);
        }
        else{
            res.json(data);
        }
    });
});

app.get('/api/schedule', (req, res)=>{
    var cutoff = new Date();
    Event.find({startTime: {$gt: cutoff}}, (err, data)=>{
        res.json(data);
    }).sort({'startTime':1});

})

app.get('/api/userschat', (req, res)=>{
    let keys = Object.keys(connections);
    let Users = []
    for (let prop in connections){
      Users.push(connections[prop]);
    }
    res.json({'users': Users});
});

app.put('/api/updateplayer/:id', (req, res)=>{
    console.log(req.params.id)
    console.log(req.body)

        User.findOne({_id:req.params.id}, (err, user)=>{
            console.log(user)
            user.firstName = req.body.firstName
            user.lastName = req.body.lastName
            user.position = req.body.position
            user.height.feet = req.body.height.feet
            user.height.inches = req.body.height.inches
            user.weight = req.body.weight
            user.dob = req.body.dob
            user.completed = true
            user.save((err, user)=>{
                if(err){
                    res.json(err)
                }
                else{
                    res.json(user)
                }
            });  
        });
    
});

app.put('/api/updatevent/:id', (req,res)=>{
    now = new Date().toISOString();
    err = []
    console.log(req.body)
    if (now > req.body.startTime){
        err.push("Event must be a future date");
    }
    if (req.body.title.length < 8){
        err.push("Title must be greater than 8 characters");
    }
    if (req.body.location.length < 3) {
        err.push("Location must be greater than 3 characters");
    }
    if (req.body.address.city.length == 0 ){
        err.push("Address is required");
    }
    if (req.body.address.state == "State" ){
        err.push("State is required");
    }
    if (req.body.type == "Event Type" ){
        err.push("Event Type is required");
    }
    if (req.body.address.zip.length == 0 ){
        err.push("Zipcode is required");
    } else { 
        if (req.body.address.zip.length != 5 ){
            err.push("Valid Zipcode required");
        }
    }
    if (err.length > 0){
        res.json({"errors": err});
    } else {


        Event.findOne({_id: req.params.id}, (err, event)=>{
            event.title = req.body.title
            event.type = req.body.type
            event.startTime = req.body.startTime
            event.location = req.body.location
            event.address.street = req.body.address.street
            event.address.city = req.body.address.city
            event.address.state = req.body.address.state
            event.address.zip = req.body.address.zip
            event.save((err, record)=>{
                if(err){
                    res.json(err)
                } else {
                    res.json(record)
                }
            })
        })
    }
})

app.get('/api/event/:id', (req, res) => {
    Event.findOne({_id:req.params.id}, (err, event)=>{
        if (err){
            res.json(err)
        } else {
            console.log(event.startTime)
            let newDate = dateFormat(event.startTime, "isoDateTime")
/*             let date = new Date(newDate)
            console.log(newDate)
            console.log(date)
            console.log(event)
            console.log("---------------------")
            event.startTime = newDate */
            console.log(event)
            res.json({"event": event, "date": newDate })
        }
    })
})

app.get('/api/event/delete/:id', (req, res)=>{
    Event.deleteOne({_id:req.params.id}, (err, event)=>{
        if (err){
            console.log(err)
        } else {
            res.json(event)
        }
    })
})

app.get('/api/players', (req, res)=>{
    User.find({}, (err, users)=>{
        console.log(users)
        res.json(users)
    })
})

app.get('/api/latestevent', (req, res)=>{
    var cutoff = new Date();
    Event.find({startTime: {$gt: cutoff}}, (err,data)=>{
        if(err){console.log(err)}
        else{
            res.json(data)
            }
        }).sort({'startTime':1}).limit(1)
})

/* app.post('/api/userschat', (req, res)=>{
    let name = req.body.firstName + ' ' + req.body.lastName;
    for (let idx in connections ){
        if(connections[idx] == name){
            console.log(connections[idx])
            delete connections[idx]
            console.log(connections)
        }
    }
}) */

app.get('*', (req, res)=> {
    res.sendFile(path.join(__dirname, 'public/dist/ang-sockets/'));
});

const server = http.createServer(app);
const io = SocketIO(server);


io.on('connection', (socket) => {
    console.log("User Connected - Home page", socket.conn.id);
    console.log("---------------------");
    console.log(connections)
    
    // Listening for newUser and adding them to Connections
    socket.on('newUser', (data)=>{
        console.log("New User: ", socket.conn.id, data)
        connections[socket.conn.id] = data['newUser'];
        console.log(connections)
        io.emit('addUser')
    });

    // Message being sent to other Users
    socket.on('message', (data)=>{
        console.log(data);
        socket.broadcast.emit('updateall', data.id + ": " + data.msg);
    });

    // When user leaves chat removing them from Connections 
    socket.on('destroyed', (data) => {
        console.log("it works", socket.conn.id)
        delete connections[socket.conn.id];
        console.log("User Disconnected", socket.conn.id);
        console.log(connections)
        socket.broadcast.emit('removeUser')
    });

    socket.on('disconnect', (data) => {
        delete connections[socket.conn.id];
        console.log("User Disconnected", socket.conn.id);
        console.log(connections)
        socket.broadcast.emit('removeUser')
    });
});

server.listen(port, ()=>{
    console.log('Server running on Port 3000');
});