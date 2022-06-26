//-----------------------------------
//Requiring Modules
//-----------------------------------
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')


//Route Imports
const UserRoutes = require('./routes/user.routes') 
const CategoryRoutes = require('./routes/categories.routes')
const TransactionRoutes = require('./routes/transaction.routes')


//-------------------------------------------
//Initializations
//-------------------------------------------
const app = express()
dotenv.config()


//-------------------------------------------
//Middlewares
//-------------------------------------------
app.use(express.json()) //enables us to send and recieve json data
app.use(cors())

//Routes
app.use('/users', UserRoutes)
app.use('/categories', CategoryRoutes)
app.use('/transactions', TransactionRoutes)


//--------------------------------------------
//Variables
//--------------------------------------------
const port = process.env.PORT || 5000
const URI = process.env.URI || 'mongodb://localhost:27017/kharcha-pani'


//-------------------------------------------
//Server Code
//-------------------------------------------
app.listen(port, ()=>console.log(`Server started at port ${port}`))

app.get('/', (req, res)=>{
    res.json('Welcome To Kharcha Pani API')
})



//-------------------------------------------
//Database Connection Code
//-------------------------------------------
mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log(`Database Connected . . . `))
.catch( err => console.log(`Erorr: ${err}`));
