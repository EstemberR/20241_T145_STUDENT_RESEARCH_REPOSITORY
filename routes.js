const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const studentRoutes = require('./routes/studentRoutes'); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

//-----------------------------USERS LOGIN/LOGOUT ROUTES---------------------------------------
//User Registration
app.post('/register', (req, res) => {
});

//User Login
app.post('/login', (req, res) => {
});

//--------------------------------USER-STUDENT ROUTES-------------------------------------------
app.use('/student', studentRoutes); 

//--------------------------------USER-INSTRUCTOR ROUTES----------------------------------------
app.use('/instructor', instructorRoutes); 

//--------------------------------USER-PANELS ROUTES--------------------------------------------
app.use('/panel', panelRoutes); 

//--------------------------------USER-ADVISER ROUTES-------------------------------------------
app.use('/adviser', adviserRoutes); 

//--------------------------------ADMIN ROUTES--------------------------------------------------
app.use('/admin', adminRoutes); 

//----------------------------------------------------------------------------------------------
app.listen(3000)
